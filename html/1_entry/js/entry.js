/* Create Account */
$('#create-account-text').click(function(){
	document.title = "Signup";
	block();
	document.getElementById('signup-form-captcha').src = 'securimage/securimage_show.php?' + Math.random();
	unblock();
	$("#login-container1").fadeOut(200, function(){
		document.getElementById("login-form1").reset();
		TweenMax.fromTo("#signup-container1", .4, {scale: 0}, {scale: 1, ease:Sine.easeInOut});
		$("#signup-container1").fadeIn();
	});
});


/* Signup Close */
$("#signup-close-img").click(function(){
	document.title = "Login";
	block();
	document.getElementById('login-form-refresh-captcha').click();
	unblock();
	TweenMax.to("#signup-container1", .4, {scale: 0, ease:Sine.easeInOut});
	$("#signup-container1").fadeOut(400, function(){
		document.getElementById("signup-form1").reset();
		$("#login-container1").fadeIn(200);
	});
	
});


/* Forgot Password */
$('#forgot-password-text').click(function(){
	document.title = "Reset";
	block();
	document.getElementById('reset-form-captcha').src = 'securimage/securimage_show.php?' + Math.random();
	unblock();
	$("#login-container1").fadeOut(200, function(){
		document.getElementById("login-form1").reset();
		TweenMax.fromTo("#reset-container1", .4, {scale: 0}, {scale: 1, ease:Sine.easeInOut});
		$("#reset-container1").fadeIn(200);
	});
});


/* Reset Close */
$("#reset-close-img").click(function(){
	document.title = "Login";
	block();
	document.getElementById('login-form-refresh-captcha').click();
	unblock();
	TweenMax.to("#reset-container1", .4, {scale: 0, ease:Sine.easeInOut});
	$("#reset-container1").fadeOut(400, function(){
		document.getElementById("reset-form1").reset();
		$("#login-container1").fadeIn(200);
	});
});


/* block UI */
function block(){
	$.blockUI({
		message: $('#loading'),
		css: {
			border: 'none',
			backgroundColor: 'transparent',
			top: '48%',
			left: '48%',
			cursor:'default'
		},
		overlayCSS: { 
			opacity:.3,
			cursor:'default'
		}
	});
	
}


/* unblock UI */
function unblock(){
	$.unblockUI();
}


/* AJAX */
function postAJAX(url, data, fun) 
{
	if(navigator.onLine)	// online
	{	
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if(this.readyState == 4)	// ready
			{
				if(this.status == 200) // success
				{
					try
					{
						if(this.responseText.length == 0)
						{
							alert("Please try again, no response from server.");
							fun(null, true);
						}
						else
						{
							json_object = JSON.parse(this.responseText);
							unblock();
							fun(json_object, false);
						}
					}
					catch(e) 
					{
						if(e instanceof SyntaxError) // failed to parse JSON
						{
							alert("Unreadable data sent from server, please try again.");
							fun(null, true);
						}
					}
				}
				else	// failure
				{
					alert("Error Code:" + this.status + "\nError: " + this.statusText);
					fun(null, true);
				}
			}	
		};
		xhttp.open("POST", url, true);
		xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhttp.send(data);
	}
	else	// offline
	{
		alert("No internet connection");
		unblock();
	}
}


/* Login step1 */
document.getElementById("login-button").addEventListener("click", function() {
	if(document.forms['login-form1'].reportValidity())
	{
		var data = "login_email=" + document.getElementById("login-email").value + 
			"&login_password=" + document.getElementById("login-password").value + 
			"&captcha_code=" + document.getElementById("login-form-captcha-code").value;
		block();
		postAJAX("backend/login.php", data, function(json_obj, error) {
			if(error)
			{
				document.getElementById('login-form-captcha').src = 'securimage/securimage_show.php?' + Math.random();
				unblock();
				document.getElementById('login-form-captcha-code').value = "";
			}
			else
			{
				if(json_obj['status'] == 0)		// invalid captcha
				{
					alert("Incorrect CAPTCHA");
				}
				else if(json_obj['status'] == 1)	// success
				{
					redirectToPassMan(json_obj);
				}
				else if(json_obj['status'] == 2)	// user registered but not authenticated
				{
					TweenMax.to("#login-container1", .4, {scale: 0, ease:Sine.easeInOut});
					$("#login-container1").fadeOut(400, function(){
						TweenMax.fromTo("#login-container2", .2, {scale: 0}, {scale: 1, ease:Sine.easeInOut});
						$("#login-container2").fadeIn(200);
					});
					alert("Enter security code to activate account.");
				}
				else if(json_obj['status'] == 3)	// multiple login attempts
				{
					TweenMax.to("#login-container1", .4, {scale: 0, ease:Sine.easeInOut});
					$("#login-container1").fadeOut(400, function(){
						TweenMax.fromTo("#login-container2", .2, {scale: 0}, {scale: 1, ease:Sine.easeInOut});
						$("#login-container2").fadeIn(200);
					});
					alert("Enter security code to activate account (multiple login attempts detected).");
				}
				else if(json_obj['status'] == 4)	// incorrect password
				{
					document.getElementById('login-form-refresh-captcha').click();
					document.getElementById('login-form-captcha-code').value = "";
					alert("Incorrect Password");
				}
				else if(json_obj['status'] == 5)	// incorrect email
				{
					document.getElementById('login-form-refresh-captcha').click();
					document.getElementById('login-form-captcha-code').value = "";
					alert("Incorrect Email");
				}
			}
		});
	}
});

document.getElementById("login-form-captcha-code").addEventListener("keydown", function(key) {
	if(key.keyCode == 13)
	{
		document.getElementById("login-button").click();
	}
});

document.getElementById("login-code").addEventListener("keydown", function(key) {
	if(key.keyCode == 13)
	{
		document.getElementById("login-code-verify-button").click();
	}
});

function redirectToPassMan(json_obj)
{
	var date = new Date();
	date.setFullYear(date.getFullYear() + 100); // 100 years from now
	document.cookie = "jwt=" + json_obj['jwt'] + "; expires=" + date.toUTCString() + "; path=/; SameSite=Strict; Secure";
	document.cookie = "PHPSESSID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure";
	window.open("../2_manager/passman.php", "_self");
}				

/* Login step2 */
document.getElementById("login-code-verify-button").addEventListener("click", function() {
	if(document.forms['login-form2'].reportValidity())
	{
		var data = "login_email=" + document.getElementById("login-email").value + 
			"&login_password=" + document.getElementById("login-password").value + 
			"&login_code=" + document.getElementById("login-code").value + "&resend_code=0&captcha_code=0";
		block();
		postAJAX("backend/login_otp_validator.php", data, function(json_obj, error) {
			if(!error)
			{
				if(json_obj['status'] == 0)		// invalid email
				{
					alert("Incorrect Email");
				}
				else if(json_obj['status'] == 1)	// Success
				{
					redirectToPassMan(json_obj);
				}
				else if(json_obj['status'] == 2)	// invalid code
				{
					alert("Invalid Security Code");
				}
				else if(json_obj['status'] == 3)	// resend code
				{
					alert("Too many attempts, security code expired. Resend new security code and try again.");
				}
				else if(json_obj['status'] == 4)	// code expired
				{
					alert("The security code has expired. Please re-send the security code to try again");
				}
				else if(json_obj['status'] == 5)	// valid code but invalid password
				{
					alert("Valid Security code, but incorrect password");
					window.location.reload();
				}
			}
			else
			{
				unblock();
			}
		});
	}
});


/* login step2 (resend security code) */
document.getElementById("login-code-resend").addEventListener("click", function() {
	block();
	document.getElementById('resend-form-captcha').src = 'securimage/securimage_show.php?' + Math.random();
	unblock();
	$("#login-container2").fadeOut();
	resendTo = 1;
	$("#resend-container").fadeIn();
});


/* Sign up step1 */
document.getElementById("signup-button").addEventListener("click", function() {
	var valid = document.forms['signup-form1'].reportValidity();
	if(valid && (document.getElementById("signup-password").value != document.getElementById("signup-confirm-password").value))
	{
		alert("Password doesn't match the confirm password");
	}
	else if(valid)
	{
		var data = "signup_email=" + document.getElementById("signup-email").value + 
		"&signup_password=" + document.getElementById("signup-password").value + 
		"&captcha_code=" + document.getElementById("signup-form-captcha-code").value;
		block();
		postAJAX("backend/signup.php", data, function(json_obj, error) {
			if(error)
			{
				document.getElementById('signup-form-captcha').src = 'securimage/securimage_show.php?' + Math.random();
				unblock();
				document.getElementById('signup-form-captcha-code').value = "";
			}
			else
			{
				if(json_obj['status'] == 0)		// invalid captcha
				{
					alert("Incorrect CAPTCHA");
				}
				else if(json_obj['status'] == 1)	// registered
				{
					TweenMax.to("#signup-container1", .4, {scale: 0, ease:Sine.easeInOut});
					$("#signup-container1").fadeOut(400, function(){
						TweenMax.fromTo("#signup-container2", .2, {scale: 0}, {scale: 1, ease:Sine.easeInOut});
						$("#signup-container2").fadeIn(200);
					});
				}
				else if(json_obj['status'] == 2)	// existing user
				{
					alert("Email address already in use, try to login.");
					window.location.reload();
				}
			}
		});
	}
});

document.getElementById("signup-form-captcha-code").addEventListener("keydown", function(key) {
	if(key.keyCode == 13)
	{
		document.getElementById("signup-button").click();
	}
});

document.getElementById("signup-code").addEventListener("keydown", function(key) {
	if(key.keyCode == 13)
	{
		document.getElementById("signup-code-verify-button").click();
	}
});

/* Sign up step2 */
document.getElementById("signup-code-verify-button").addEventListener("click", function() {
	if(document.forms['signup-form2'].reportValidity())
	{
		var data = "signup_email=" + document.getElementById("signup-email").value + 
			"&signup_password=" + document.getElementById("signup-password").value + 
			"&signup_code=" + document.getElementById("signup-code").value + "&resend_code=0&captcha_code=0";
		block();
		postAJAX("backend/signup_otp_validator.php", data, function(json_obj, error) {
			if(!error)
			{
				if(json_obj['status'] == 0)		// invalid user
				{
					alert("Invalid User");
				}
				else if(json_obj['status'] == 1)	// Success
				{
					alert("Account Successfully Created");
					window.location.reload();
				}
				else if(json_obj['status'] == 2)	// invalid code
				{
					alert("Invalid Security Code");
				}
				else if(json_obj['status'] == 3)	// resend code
				{
					alert("Too many attempts, security code expired. Resend new security code and try again.");
				}
				else if(json_obj['status'] == 4)	// code expired
				{
					alert("The security code has expired. Please re-send the security code to try again");
				}
			}
			else
			{
				unblock();
			}
		});
	}
});


/* Sign up step2 (resend security code) */
document.getElementById("signup-code-resend").addEventListener("click", function() {
	block();
	document.getElementById('resend-form-captcha').src = 'securimage/securimage_show.php?' + Math.random();
	unblock();
	$("#signup-container2").fadeOut();
	resendTo = 2;
	$("#resend-container").fadeIn();
});


/* Reset step1 */
document.getElementById("reset-button").addEventListener("click", function() {
	var valid = document.forms['reset-form1'].reportValidity();
	if(valid && (document.getElementById("reset-password").value != document.getElementById("reset-confirm-password").value))
	{
		alert("Password doesn't match the confirm password");
	}
	else if(valid)
	{
		var data = "reset_email=" + document.getElementById("reset-email").value + 
		"&captcha_code=" + document.getElementById("reset-form-captcha-code").value;
		block();
		postAJAX("backend/reset.php", data, function(json_obj, error) {
			if(error)
			{
				document.getElementById('reset-form-captcha').src = 'securimage/securimage_show.php?' + Math.random();
				unblock();
				document.getElementById('reset-form-captcha-code').value = "";
			}
			else
			{
				if(json_obj['status'] == 0)		// invalid captcha
				{
					alert("Incorrect CAPTCHA");
				}
				else if(json_obj['status'] == 1)	// registered
				{
					TweenMax.to("#reset-container1", .4, {scale: 0, ease:Sine.easeInOut});
					$("#reset-container1").fadeOut(400, function(){
						TweenMax.fromTo("#reset-container2", .2, {scale: 0}, {scale: 1, ease:Sine.easeInOut});
						$("#reset-container2").fadeIn(200);
					});
				}
				else if(json_obj['status'] == 2)	// invalid user
				{
					alert("Invalid user, try to create account.");
					document.getElementById('reset-form-refresh-captcha').click();
					document.getElementById('reset-form-captcha-code').value = "";
				}
			}
		});
	}
});

document.getElementById("reset-form-captcha-code").addEventListener("keydown", function(key) {
	if(key.keyCode == 13)
	{
		document.getElementById("reset-button").click();
	}
});

document.getElementById("reset-code").addEventListener("keydown", function(key) {
	if(key.keyCode == 13)
	{
		document.getElementById("reset-code-verify-button").click();
	}
});

/* Reset step2 */
document.getElementById("reset-code-verify-button").addEventListener("click", function() {
	if(document.forms['reset-form2'].reportValidity())
	{
		var data = "reset_email=" + document.getElementById("reset-email").value + 
			"&reset_password=" + document.getElementById("reset-password").value + 
			"&reset_code=" + document.getElementById("reset-code").value + "&resend_code=0&captcha_code=0";
		block();
		postAJAX("backend/reset_otp_validator.php", data, function(json_obj, error) {
			if(!error)
			{
				if(json_obj['status'] == 0)		// invalid user
				{
					alert("Invalid User");
				}
				else if(json_obj['status'] == 1)	// Success
				{
					alert("Password changed successfully!");
					window.location.reload();
				}
				else if(json_obj['status'] == 2)	// invalid code
				{
					alert("Invalid Security Code");
				}
				else if(json_obj['status'] == 3)	// resend code
				{
					alert("Too many attempts, security code expired. Resend new security code and try again.");
				}
				else if(json_obj['status'] == 4)	// code expired
				{
					alert("The security code has expired. Please re-send the security code to try again");
				}
			}
			else
			{
				unblock();
			}
		});
	}
});


/* Reset step2 (resend security code) */
document.getElementById("reset-code-resend").addEventListener("click", function() {
	block();
	document.getElementById('resend-form-captcha').src = 'securimage/securimage_show.php?' + Math.random();
	unblock();
	$("#reset-container2").fadeOut();
	resendTo = 3;
	$("#resend-container").fadeIn();
});

document.getElementById("resend-form-captcha-code").addEventListener("keydown", function(key) {
	if(key.keyCode == 13)
	{
		document.getElementById("resend-button").click();
	}
});

/* Resend Code(captcha check button) */
var resendTo = 0;
document.getElementById("resend-button").addEventListener("click", function() {
	if(resendTo == 1)		// login resend
	{
		if(document.forms['resend-form'].reportValidity())
		{
			var data = "login_email=" + document.getElementById("login-email").value + 
			"&login_password=" + document.getElementById("login-password").value + 
			"&login_code=0&resend_code=1&captcha_code=" + document.getElementById("resend-form-captcha-code").value;
			block();
			postAJAX("backend/login_otp_validator.php", data, function(json_obj, error) {
				if(!error)
				{
					if(json_obj['status'] == 0)		// invalid email
					{
						alert("Incorrect Email");
					}	
					else if(json_obj['status'] == 1)	// resend code
					{
						alert("New security code has been sent to your email(" + document.getElementById("login-email").value +")");
					}
					else if(json_obj['status'] == 2)	// invalid captcha
					{
						alert("Incorrect CAPTCHA");
						return;
					}
				}
				else
				{
					unblock();
				}
				resendTo = 0;
				$("#resend-container").fadeOut();
				document.getElementById("resend-form").reset();
				$("#login-container2").fadeIn();
			});
		}
	}
	else if(resendTo == 2)		// sigin resend
	{
		if(document.forms['resend-form'].reportValidity())
		{
			var data = "signup_email=" + document.getElementById("signup-email").value + 
			"&signup_password=" + document.getElementById("signup-password").value + 
			"&signup_code=0&resend_code=1&captcha_code=" + document.getElementById("resend-form-captcha-code").value;
			block();
			postAJAX("backend/signup_otp_validator.php", data, function(json_obj, error) {
				if(!error)
				{
					if(json_obj['status'] == 0)		// invalid user
					{
						alert("Invalid User");
					}	
					else if(json_obj['status'] == 1)	// resend code
					{
						alert("New security code has been sent to your email(" + document.getElementById("signup-email").value +")");
					}
					else if(json_obj['status'] == 2)	// invalid captcha
					{
						alert("Incorrect CAPTCHA");
						return;
					}
				}
				else
				{
					unblock();
				}
				resendTo = 0;
				$("#resend-container").fadeOut();
				document.getElementById("resend-form").reset();
				$("#signup-container2").fadeIn();
			});
		}
	}
	else if(resendTo == 3)		// reset resend
	{		
		if(document.forms['resend-form'].reportValidity())
		{
			var data = "reset_email=" + document.getElementById("reset-email").value + 
			"&reset_password=0&reset_code=0&resend_code=1&captcha_code=" + document.getElementById("resend-form-captcha-code").value;
			block();
			postAJAX("backend/reset_otp_validator.php", data, function(json_obj, error) {
				if(!error)
				{
					if(json_obj['status'] == 0)		// invalid user
					{
						alert("Invalid User");
					}	
					else if(json_obj['status'] == 1)	// resend code
					{
						alert("New security code has been sent to your email(" + document.getElementById("reset-email").value +")");
					}
					else if(json_obj['status'] == 2)	// invalid captcha
					{
						alert("Incorrect CAPTCHA");
						return;
					}
				}
				else
				{
					unblock();
				}
				resendTo = 0;
				$("#resend-container").fadeOut();
				document.getElementById("resend-form").reset();
				$("#reset-container2").fadeIn();
			});
		}
	}
});


/* Resend Code(close image) */
document.getElementById("resend-close-img").addEventListener("click", function() {
	if(resendTo == 1)	
	{
		resendTo = 0;
		$("#resend-container").fadeOut();
		document.getElementById("resend-form").reset();
		$("#login-container2").fadeIn();
	}
	else if(resendTo == 2)	
	{
		resendTo = 0;
		$("#resend-container").fadeOut();
		document.getElementById("resend-form").reset();
		$("#signup-container2").fadeIn();
	}
	else if(resendTo == 3)	
	{
		resendTo = 0;
		$("#resend-container").fadeOut();
		document.getElementById("resend-form").reset();
		$("#reset-container2").fadeIn();
	}
});


/* Cookies Disables Message */
if(!navigator.cookieEnabled)
{
	alert("Cookies should be enabled in your browser for CAPTCHA validation and User Authorization.");
}


/* online hide image */
window.addEventListener('online', () => { document.getElementById("offline").style.display = "none"; });


/* onffline display image */
window.addEventListener('offline', () => { document.getElementById("offline").style.display = "block"; });
