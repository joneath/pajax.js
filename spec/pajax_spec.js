describe("pajax", function() {
  beforeEach(function() {
    jasmine.Ajax.useMock();
  });

  describe("passing the pajax object as a AJAX callback", function() {
    it("should return a callback function", function() {
      var callback = pajax();
      expect(typeof callback).toEqual("function");
    });

    describe("on response", function() {
      var pageOne, pageTwo, onPageSpy, onPageReturn;

      beforeEach(function() {
        onPageSpy = {
          onPage: function(){ return onPageReturn }
        }
        onPageSpy = spyOn(onPageSpy, "onPage").andCallThrough();

        pageOne = [
          {
            one: 1
          },
          {
            two: 2
          }
        ];
        pageTwo = [
          {
            three: 3,
          },
          {
            four: 4
          }
        ];
      });

      it("should call the onPage callback with the response and exports", function() {
        var pajaxCallback = pajax({
          onPage: onPageSpy
        });
        pajaxCallback(pageOne);

        expect(onPageSpy).toHaveBeenCalledWith(pageOne, {page: 1, collection: [pageOne]});
      });

      describe("when providing a parse callback", function() {
        it("should call the passed parse callback with the response", function() {
          var parseSpy = jasmine.createSpy("parseSpy");
          var pajaxCallback = pajax({
            parse: parseSpy
          });
          pajaxCallback(pageOne);

          expect(parseSpy).toHaveBeenCalledWith(pageOne);
        });

        it("should collect only results returned from the parse callback", function() {
          var parsedResults = {parsed: true};

          var pajaxCallback = pajax({
            onPage: onPageSpy,
            parse: function(response) { return parsedResults; }
          });
          pajaxCallback(pageOne);

          expect(onPageSpy).toHaveBeenCalledWith(pageOne, {page: 1, collection: [parsedResults]});
        });
      });

      describe("when returning false on the onPage callback", function() {
        it("should not request the next page", function() {
          var pajaxCallback = pajax({
            onPage: function() {
              return false;
            }
          });
          pajaxCallback(pageOne);

          var request = mostRecentAjaxRequest();
          expect(request).toBeNull();
        });

        it("should call the onComplete callback with the collection", function() {
          var onCompleteSpy = jasmine.createSpy("onComplete");
          var pajaxCallback = pajax({
            onPage: function() {
              return false;
            },
            onComplete: onCompleteSpy
          });
          pajaxCallback(pageOne);

          expect(onCompleteSpy).toHaveBeenCalledWith([pageOne]);
        });
      });

      describe("when returning the second page request string on the onPage callback", function() {
        var request, onErrorSpy;

        beforeEach(function() {
          onErrorSpy = jasmine.createSpy("onError");

          var pajaxCallback = pajax({
            onPage: onPageSpy,
            onError: onErrorSpy
          });
          onPageReturn = "http://example.com?page=2";
          pajaxCallback(pageOne);

          request = mostRecentAjaxRequest();
        });

        it("should request the second page", function() {
          expect(request.url).toEqual("http://example.com?page=2");
        });

        describe("on success", function() {
          it("should call the onPage callback with the response and exports", function() {
            onPageSpy.reset();
            onPageReturn = [pageTwo, {page: 2, collection: [pageOne, pageTwo]}];
            request.response({
              status: 200,
              responseText: JSON.stringify(pageTwo)
            });

            expect(onPageSpy).toHaveBeenCalledWith(pageTwo, {page: 2, collection: [pageOne, pageTwo]});
          });
        });

        describe("on error", function() {
          it("should call the onError callback with the response and exports", function() {
            onPageSpy.reset();
            var errorResponse = {error: {text: "This is an error"}};
            request.response({
              status: 503,
              responseText: JSON.stringify(errorResponse)
            });

            expect(onErrorSpy).toHaveBeenCalled();
          });
        });
      });
    });
  });
});
