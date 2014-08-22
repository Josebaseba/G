G
======
#### JS ultra small library for promises and ajax requests
-----

######TODO: Finish documentation

#####METHODS:

######Promise:
Generate a instance of a promise

		var promise = new G.Promise();

######parallel:
Run diferents async functions at the same time, at the end get all the values in order.

		G.parallel([
			async(x),
			async2(x,y,z),
			async3()
		]).then(function(err, res){});

######waterfall:
Run async functions in order, passing values between them (optional).

		G.waterfall([function(){
			return async(1);
		  },
		  function(err, res){
		  	return async2(res);
		  }
		]).then(function(err, last_res){});

######ajax:
Send ajax request.

		TYPE   : "GET", "POST", "PUT", "DELETE" - String - Default "GET"
		URL    : String
		DATA   : Object - Default {}
		OPTIONS: Object
		         OPTIONS.headers: Object - default {}
		         OPTIONS.type   : String - default "json"

		G.ajax("TYPE", "url", {data}, {options}).then(function(err, res, xhr){});

#####ATTRIBUTES

######headers:
Set default headers for every request. If you add headers attribute in an ajax request, that new headers will be combined with default headers. In case that some new header coincide with default header, that will be overwritten only in that request.

	G.headers = {access_token: "aXcDDSrYgVhlPyQcVrERFd"}

######ajaxTimeout:
Set timeout to the request, if the request goes longer than time (in milisecs) the request fails.

	G.ajaxTimeout = 3000




