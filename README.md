pajax.js
========
pajax simplifies the common pattern of looping requests for the next page until the desired endpoint is found.

## Getting Started
You use pajax just like any other AJAX callback but you specify a few additional callback functions to tell pajax the next page url and when to stop. Here is how you could fetch the first 5 pages of users.

	$.getJSON("/users.json", pajax({
	  onPage: function(response, context) {
		if (context.page < 5) {
		  return "/users.json?page=" context.page + 1;
		}
	  },
	  onComplete: function(collection) {
		console.log("Here are the first five pages:", collection);
	  }
	}));

#### Callbacks

`onPage` is called each time a page is returned from the server. It's passed the successful response of the AJAX call as well as a context object. `onPage` is responsible for returning either the url for the next page to fetch, or a falsy value to stop the fetch loop *(default return value of undefined will stop the loop)*.

	onPage: function(response, context) {
	  if (context.page < 3) {
		return "/feed?page=" + context.page + 1;
	  }
	}

##### What's in a context object?
A context object is a simple object literal with two properties, page and collection

	context: {
	  page: 1 // Current requested page,
	  collection: [pageOneResults, pageTwoResults] // Array of each page's response
	}

`onComplete` is called when the `onPage` callback returns a falsy value *(null, undefined, false, 0)*. It's passed the collection of page results.

	onComplete: function(collection) {
	  // collection is an array of pages, not the flattened collection of page results!
	}

`onError` is called when the AJAX request fails.

	onError: function(jqXHR, textStatus) { … }

`parse` can be used if the resource you're requesting returns extraneous data that you do not want to include in your collection.

	parse: function(response) {
	  return response.data;
	}

## Examples

#### Facebook API
Here is an example of how we could fetch the first 200 items from a users feed.

	FB.api("me/feed", pajax({
	  parse: function(response) {
        return response.data;
	  },
	  onPage: function(response, context) {
		if (_.flatten(context.collection).length < 200) {
		  return response.paging.next;
		}
	  },
	  onComplete: function(collection) {
		console.log("Here is your feed", collection);
	  }
	}));
