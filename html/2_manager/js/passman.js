function setIdCookie(id)
{
	document.cookie = "id="+ id +"; path=/; SameSite=Strict; Secure";
}

function deleteIdCookie()
{
	document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure";
}

function setAppendCookie(a)
{
	document.cookie = "append="+ a +"; path=/; SameSite=Strict; Secure";
}

function deleteAppendCookie()
{
	document.cookie = "append=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure";
}

function setHeaderCookie(h)
{
	document.cookie = "header="+ h +"; path=/; SameSite=Strict; Secure";
}

function deleteHeaderCookie()
{
	document.cookie = "header=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure";
}

deleteIdCookie();
deleteAppendCookie();
deleteHeaderCookie();


/* block UI */
function block()
{
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
function unblock()
{
	$.unblockUI();
}


/* AJAX */
function postAjaxJson(url, data, fun) 
{
	if(navigator.onLine)	// online
	{	
		let xhttp = new XMLHttpRequest();
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
							fun(json_object, false);
						}
					}
					catch(e) 
					{
						if(e instanceof SyntaxError) // failed to parse JSON
						{
							alert("Unreadable data sent from server, please try again.");
						}
						fun(null, true);
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
		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.send(data);
	}
	else	// offline
	{
		alert("No internet connection");
		fun(null, true);
	}
}

function postAjaxBinary(url, data, fun) 
{
	if(navigator.onLine)	// online
	{	
		let xhttp = new XMLHttpRequest();
		xhttp.responseType = "arraybuffer";
		xhttp.onreadystatechange = function() {
			if(this.readyState == 4)	// ready
			{
				if(this.status == 200) // success
				{
					if(this.response.byteLength == 0)
					{
						alert("Please try again, no response from server.");
						fun(null, true);
					}
					else
					{
						fun(this.response, false);
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
		xhttp.send(data);
	}
	else	// offline
	{
		alert("No internet connection");
		fun(null, true);
	}
}

var crypto_key;
var nec = null;
var ec = null;
var mc = {};
const AUTH = new Uint8Array([112,97,115,115,46,109,97,110,97,103,101,114]);
const SAMPLE_DATA = new Uint8Array([76,111,114,101,109,32,105,112,115,117,109,32,100,111,108,111,114,32,115,105,116,32,97,109,101,116,44,32,99,111,110,115,101,99,116,101,116,117,114,32,97,100,105,112,105,115,99,105,110,103,32,101,108,105,116,44,32,115,101,100,32,100,111,32,101,105,117,115,109,111,100,32,116,101,109,112,111,114,32,105,110,99,105,100,105,100,117,110,116,32,117,116,32,108,97,98,111,114,101,32,101,116,32,100,111,108,111,114,101,32,109,97,103,110,97,32,97,108,105,113,117,97,46]);
const SUPPORTED_IMAGE_LIST = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/bmp", "image/avif" , "image/x-icon"]; // lowercase only
const MAX_BYTES = 2097152;		// bytes


/* Import Key */
async function digestAndImportKey(key_string) 
{
	let hash;
	await crypto.subtle.digest('SHA-256', new TextEncoder('utf-8').encode(key_string)).then(h => {
		hash = h;
	}, reason => {
		alert("key digest error: " + reason); // Error!
		unblock();
	});
	return await crypto.subtle.importKey('raw', hash, {"name":"AES-GCM"}, false, ['encrypt','decrypt']);
}

/* Encrypt */
async function encrypt(data, iv) 
{
	let cipher;
	let error = false;
	await crypto.subtle.encrypt({name: "AES-GCM", iv: iv, additionalData: AUTH, tagLength: 128}, crypto_key, data).then( e => {
		cipher = e;
	}, reason => {
		alert("Encryption error: " + reason); // Error!
		error = true;
	});
	if(error) {
		throw 0;
	}
	else {
		return cipher;
	}
}

/* Decrypt */
async function decrypt(cipher, iv) 
{
	let data;
	let error = false;
	await crypto.subtle.decrypt({name: "AES-GCM", iv: iv, additionalData: AUTH, tagLength: 128}, crypto_key, cipher).then( d => {
		data = d;
	}, reason => {
		alert("Decryption error: " + reason ); // Error!
		error = true;
	});
	if(error) {
		throw 0;
	}
	else {
		return data;
	}
}

function reloginAlert()
{
	alert("Please try to re-login!\nReasons:\n-> cookies blocked, disabled, edited or using expired one.\n-> logged in on another device, browser, tab or etc.");
}

/* new user and new crypto password*/
if(document.getElementById("c1-new-user-submit"))
{
	document.getElementById("c1-new-user-submit").addEventListener("click", function() {
		let key = document.getElementById("c1-new-user-key").value;
		if(key.length > 0)	// non-empty password
		{
			block();
			digestAndImportKey(key).then((ck) => {	// importkey
				crypto_key = ck;
				let iv = crypto.getRandomValues(new Uint8Array(12));
				encrypt(SAMPLE_DATA, iv).then((c) => {	// encrypt
					setHeaderCookie(JSON.stringify({"iv": Array.from(iv)}));
					postAjaxBinary("backend/new_user_new_crypto.php", new Uint8Array(c), (bin_res, error) => {	// send data to server	
						deleteHeaderCookie();
						if(!error)
						{
							bin_res = new Uint8Array(bin_res);
							if(bin_res[0] == 48)	// re-login
							{
								reloginAlert();
							}
							else if(bin_res[0] == 49)	// success
							{
								document.getElementById("container1").style.display = "none";
								document.getElementById("container2").style.display = "block";
							}
						}
						unblock();
					});
				}, reason => {
					unblock();
				});
			}, reason => {
				alert("import key error: " + reason); // Error!
				unblock();
			});
		}
		else	//empty password
		{
			alert("Password can't be blank");
		}
	});
}

/* check whether two arrays are equal */
function isEqualArray(first, second)
{
	if(first.length != second.length)
    {
    	return false;
    }
    let i = first.length;
    while(i--) 
    {
        if(first[i] !== second[i]) 
        {
        	return false;
        }
    }
    return true
}


/* validate key */
if(document.getElementById("c1-submit"))
{
	document.getElementById("c1-submit").addEventListener("click", function() {
		let key = document.getElementById("c1-key").value;
		if(key.length > 0)	// non-empty password
		{
			block();
			digestAndImportKey(key).then((ck) => {	// importkey
				crypto_key = ck;
				postAjaxJson("backend/key_validator.php", "1", (json_obj, error) => {
					if(!error)
					{
						if(json_obj['status'] == 0)		// re-login
						{
							reloginAlert();
							unblock();
						}
						else if(json_obj['status'] == 1)	// success
						{
							let json_data = json_obj['data'];
							let iv = new Uint8Array(json_data['iv']).buffer;
							postAjaxBinary("backend/key_validator.php", "0", (cipher, error) => {	// receive cipher
								if(!error)
								{
									if(cipher.byteLength == 12 && new Uint8Array(cipher)[10] == 48)	// status 0
									{
										reloginAlert();
										unblock();
									}
									else
									{
										decrypt(cipher, iv).then((d) => {	// Decrypt
											if(isEqualArray(new Uint8Array(d), SAMPLE_DATA))	//success
											{
												document.getElementById("container1").style.display = "none";
												document.getElementById("container2").style.display = "block";
												postAjaxJson("backend/utils/getid_from_db.php", "{}", (json_obj, error) => {
													if(!error)
													{
														if(json_obj['status'] == 0)		// re-login
														{
															reloginAlert();
															unblock();
														}
														else if(json_obj['status'] == 1)
														{
															postAjaxJson("backend/utils/cleanup.php", "{}", (json_obj, error) => {});	//clean up call
															decrypt_1(json_obj['ids'], 0);
														}
													}
													else
													{
														unblock();
													}
												});
											}
										}, reason => {
											document.getElementById("c1-key").value = "";
											unblock();
										});
									}
								}
								else
								{
									unblock();
								}
							});	
						}
					}
					else
					{
						unblock();
					}
				});
			}, reason => {
				alert("import key error: " + reason); // Error!
				unblock();
			});
			
		}
		else	//empty password
		{
			alert("Password can't be blank");
		}
	});
}


function decrypt_1(id_list, id_list_index)
{
	if(id_list_index < id_list.length)	
	{
		postAjaxJson("backend/getheader_and_size_from_db.php", JSON.stringify(id_list[id_list_index]), (json_obj, error) => {
			if(!error)
			{
				if(json_obj['status'] == 0)		// re-login
				{
					reloginAlert();
					unblock();
				}
				else if(json_obj['status'] == 1)	//success
				{
					let header = json_obj['header'];
					let size_in_bytes = json_obj['size'];
					let iter = Math.ceil(size_in_bytes / MAX_BYTES);
					if(iter == 1)	// single go
					{
						let temp = {"id": id_list[id_list_index], "start": 0, "length": size_in_bytes};
						temp = JSON.stringify(temp);
						postAjaxBinary("backend/getcipher_from_db.php", temp, (bin_res, error) => {	// receive cipher
							if(!error)
							{	
								if(bin_res.byteLength == 1 && new Uint8Array(bin_res)[0] == 48)	// status 0
								{
									reloginAlert();
									unblock();
								}
								else	//success
								{
									decrypt(bin_res, new Uint8Array(header.iv)).then((d) => {	// Decrypt
										let dc = new DecodeClass(d, header, id_list[id_list_index]);
										dc.decode();
										decrypt_1(id_list, id_list_index+1); //recursion
									}, reason => {
										unblock();
									});	
								}
							}
							else
							{
								unblock();
							}
						});
					}
					else	// multiple go
					{
						decrypt_2(id_list, id_list_index, header, iter, 0, []);
					}
				}
			}
			else
			{
				unblock();
			}
		});
	}
	else	// done
	{
		pls.paint();
		unblock();
	}
}

function decrypt_2(id_list, id_list_index, header, iter, start, cipher)
{
	if(iter == 0) 	// base condition
	{
		decrypt(new Uint8Array(cipher).buffer, new Uint8Array(header.iv)).then((d) => {	// Decrypt
			let dc = new DecodeClass(d, header, id_list[id_list_index]);
			dc.decode();
			decrypt_1(id_list, id_list_index+1); 
		}, reason => {
			unblock();
		});	
		return;
	}
	
	let temp = {"id": id_list[id_list_index], "start": start, "length": MAX_BYTES};
	temp = JSON.stringify(temp);
	postAjaxBinary("backend/getcipher_from_db.php", temp, (bin_res, error) => {	// receive cipher
		if(!error)
		{	
			if(bin_res.byteLength == 1 && new Uint8Array(bin_res)[0] == 48)	// status 0
			{
				reloginAlert();
				unblock();
			}
			else	//success
			{
				cipher = cipher.concat(Array.from(new Uint8Array(bin_res)));
				decrypt_2(id_list, id_list_index, header, iter-1, start+MAX_BYTES, cipher)
			}
		}
		else
		{
			unblock();
		}
	});
}

class MasterClass
{
	constructor(id, logo, title, username, password, url, notes, attachments)
	{
		this.id = id;
		this.logo = logo;
		this.title = title;
		this.username = username;
		this.password = password;
		this.url = url;
		this.notes = notes;
		this.attachments = attachments;
	}
}


class PaintLeftSection
{
	paint()
	{
		let list_of_ls = [];
		for(let mc_single in mc) 
		{
			list_of_ls.push({"id": mc[mc_single].id, "logo": mc[mc_single].logo, "title": mc[mc_single].title});
		}
		list_of_ls.sort((a, b) => a.title.localeCompare(b.title, undefined, {sensitivity: 'base'}));
		let temp1 = [];	// other than alphabets
		let temp3 = [];	// alphabets
		for(let i=0, temp2; i<list_of_ls.length ; i++)
		{
			temp2 = list_of_ls[i].title;
			if(temp2 === "")	//empty
			{
				temp1.push(list_of_ls[i]);
			}
			else if((temp2.charCodeAt(0) >= 65 && temp2.charCodeAt(0) <= 90) || (temp2.charCodeAt(0) >= 97 && temp2.charCodeAt(0) <= 122))  //starts witha alphabets
			{
				temp3.push(list_of_ls[i]);
			}
			else	//other
			{
				temp1.push(list_of_ls[i]);
			}
		}
		list_of_ls = temp3.concat(temp1);
		
		let parent = document.getElementById("left-section-container");
		while(parent.firstChild) 
		{
			parent.firstChild.remove()
		}
		let alpha = {"A": 0, "B": 0, "C": 0, "D": 0, "E": 0, "F": 0, "G": 0, "H": 0, "I": 0, "J": 0, 
			"K": 0, "L": 0, "M": 0, "N": 0, "O": 0, "P": 0, "Q": 0, "R": 0, "S": 0, "T": 0, "U": 0, "V": 0, 
			"W": 0, "X": 0, "Y": 0, "Z": 0, "#": 0};
		list_of_ls.forEach(dict => {
			if(dict.title === "")	//empty
			{
				if(alpha["#"] == 0)
				{
					parent.innerHTML += `<div class="l-s-index-style">#</div>`;
					alpha["#"] = 1;
				}
			}
			else if((dict.title.charCodeAt(0) >= 65 && dict.title.charCodeAt(0) <= 90) || (dict.title.charCodeAt(0) >= 97 && dict.title.charCodeAt(0) <= 122))  //starts witha alphabets
			{
				temp1 = dict.title.charAt(0).toUpperCase();
				if(alpha[temp1] == 0)
				{
					parent.innerHTML += `<div class="l-s-index-style">` + temp1 + `</div>`;
					alpha[temp1] = 1;
				}
			}
			else	//other
			{
				if(alpha["#"] == 0)
				{
					parent.innerHTML += `<div class="l-s-index-style">#</div>`;
					alpha["#"] = 1;
				}
			}
			
			let img;
			if(dict.logo === null)
			{
				img = `<img src="../1_entry/images/icon.svg" class="l-s-logo" />`;
			}
			else
			{
				let blobUrl = URL.createObjectURL(new Blob([dict.logo]));
				img = `<img src='${blobUrl}' class="l-s-logo" />`;
			}
			let HTML = `
			<div class="l-s-style" onclick="readonlyView(${dict.id});">
				<div class="l-s-logo-container">
				` +
				img 
				+ `
				</div>	
				<div class="l-s-title">${dict.title}</div>
			</div>
			`;
			parent.innerHTML += HTML;
		});
	}
	
	paintSearch(text)
	{
		text = text.toLowerCase();
		let list_of_ls = [];
		for(let mc_single in mc) 
		{
			if(mc[mc_single].title.toLowerCase().startsWith(text))
			{
				list_of_ls.push({"id": mc[mc_single].id, "logo": mc[mc_single].logo, "title": mc[mc_single].title});
			}
		}
		list_of_ls.sort((a, b) => a.title.localeCompare(b.title, undefined, {sensitivity: 'base'}));	
		let parent = document.getElementById("left-section-container");
		while(parent.firstChild) 
		{
			parent.firstChild.remove()
		}
		list_of_ls.forEach(dict => {
			let img;
			if(dict.logo === null)
			{
				img = `<img src="../1_entry/images/icon.svg" class="l-s-logo" />`;
			}
			else
			{
				let blobUrl = URL.createObjectURL(new Blob([dict.logo]));
				img = `<img src='${blobUrl}' class="l-s-logo" />`;
			}
			let HTML = `
			<div class="l-s-style" onclick="readonlyView(${dict.id});">
				<div class="l-s-logo-container">
				` +
				img 
				+ `
				</div>	
				<div class="l-s-title">${dict.title}</div>
			</div>
			`;
			parent.innerHTML += HTML;
		});
	}
}
var pls = new PaintLeftSection();

/* search onchange */
document.getElementById("search").oninput = function() {
	if(document.getElementById("search").value === "")
	{
		pls.paint();
	}
	else
	{
		pls.paintSearch(document.getElementById("search").value);
	}
}

var global_id;
/* on-click left section row */
function readonlyView(id)
{
	cleanEditContainer();
	document.getElementById("cancel-btn").style.display = "none";
	document.getElementById("delete-btn").style.display = "none";
	document.getElementById("edit").style.display = "none";
	document.getElementById("save-btn").style.display = "none";
	document.getElementById('edit-btn').style.display = "block";
	document.getElementById("non-edit").style.display = "block";
	cleanNonEditContainer();
	global_id = id;
	if(mc[id].logo != null)
	{
		document.getElementById('rs-c1-ne-logo').src = URL.createObjectURL(new Blob([mc[id].logo]));
	}
	document.getElementById('rs-c1-ne-title').innerHTML = mc[id].title;
	document.getElementById('rs-c2-ne-ut').innerHTML = mc[id].username;
			
	if(mc[id].password != "")
	{
		document.getElementById("rs-c2-ne-p-eye-open").style.display = "block";
		document.getElementById('rs-c2-ne-pt').innerHTML = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
	}
	
	if(mc[id].url != "")
	{
		let HTML = `
			<a href="${mc[id].url}" id="rs-c3-ne-wl" target="_blank">${mc[id].url}</a>
		`;
		document.getElementById('rs-c3-ne-wn').innerHTML = HTML;
	}
	document.getElementById('rs-c4-ne-te').innerHTML = mc[id].notes;
	
	let parent = document.getElementById('rs-c5-ac2-dyn-files');
	for(let filename in mc[id].attachments) 
	{
		let filename_encoded = new TextEncoder().encode(filename).toString();
		let HTML = `
		<div class="rs-c5-ne-a-row">
			<div class="rs-c5-a-text">
			` + 
			filename
			+ `
			</div>
			<div class="rs-c5-a-icon">
				<svg style="cursor: pointer;" onclick="downloadFile(${id}, '${filename_encoded}');" height='5vh' width='3vw' viewBox="0 0 100 100"><g><path d="M31.618,42.554c-0.798,0.764-0.827,2.029-0.064,2.828L50,64.684l18.446-19.302c0.763-0.799,0.734-2.064-0.064-2.828   c-0.798-0.763-2.065-0.733-2.828,0.064L52,56.802V21c0-1.104-0.896-2-2-2s-2,0.896-2,2v35.802L34.446,42.618   C33.684,41.819,32.417,41.791,31.618,42.554z"></path><path d="M20,57c-1.104,0-2,0.896-2,2v9.091C18,75.33,23.471,81,30.455,81h39.091C76.529,81,82,75.33,82,68.091v-8.637   c0-1.104-0.896-2-2-2s-2,0.896-2,2v8.637C78,73.17,74.365,77,69.545,77H30.455C25.635,77,22,73.17,22,68.091V59   C22,57.896,21.104,57,20,57z"></path></g></svg>
			</div>
		</div>
		`;
		parent.innerHTML += HTML;
	}
	var date = new Date(0);
	date.setUTCSeconds(id);
	document.getElementById('created-on-text').innerHTML = "Created On: " + date;
}

/* on click eye open */
document.getElementById("rs-c2-ne-p-eye-open").addEventListener("click", function() {
	document.getElementById('rs-c2-ne-pt').innerHTML = mc[global_id].password;
	document.getElementById("rs-c2-ne-p-eye-open").style.display = "none";
	document.getElementById("rs-c2-ne-p-eye-close").style.display = "block";
});

/* on click eye close */
document.getElementById("rs-c2-ne-p-eye-close").addEventListener("click", function() {
	document.getElementById('rs-c2-ne-pt').innerHTML = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
	document.getElementById("rs-c2-ne-p-eye-close").style.display = "none";
	document.getElementById("rs-c2-ne-p-eye-open").style.display = "block";
});

/* copy to clipboard password */
document.getElementById("rs-c2-ne-pt").addEventListener("copy", function(e) {
	e.clipboardData.setData('text/plain', mc[global_id].password);
	e.preventDefault();
});

/* reset edit container */	
function cleanEditContainer()
{
	document.getElementById('rs-c1-e-logo').src = "images/edit.svg";
	document.getElementById('rs-c1-e-title-field').value = "";
	document.getElementById('rs-c2-e-username-field').value = "";
	document.getElementById('rs-c2-e-password-field').value = "";
	document.getElementById("rs-c2-ne-p-eye-open").style.display = "none";
	document.getElementById("rs-c2-ne-p-eye-close").style.display = "none";
	document.getElementById('rs-c3-e-url-field').value = "";
	document.getElementById('rs-c4-e-te').innerHTML = "";
	let parent = document.getElementById('rs-c5-ac2-e-color');
	while(parent.firstChild) 
	{
		parent.firstChild.remove()
	}
	document.getElementById('edit').scrollTop = 0;
}

/* reset non-edit container */
function cleanNonEditContainer()
{
	document.getElementById('rs-c1-ne-logo').src = "../1_entry/images/icon.svg";
	document.getElementById('rs-c1-ne-title').innerHTML = "";
	document.getElementById('rs-c2-ne-ut').innerHTML = "";
	document.getElementById('rs-c2-ne-pt').innerHTML = "";
	document.getElementById('rs-c3-ne-wn').innerHTML = "";
	document.getElementById('rs-c4-ne-te').innerHTML = "";
	let parent = document.getElementById('rs-c5-ac2-dyn-files');
	while(parent.firstChild) 
	{
		parent.firstChild.remove()
	}
	document.getElementById('non-edit').scrollTop = 0;
}

/* on-click edit button */
document.getElementById('edit-btn').addEventListener("click", function() {
	document.getElementById('edit-btn').style.display = "none";
	document.getElementById('cancel-btn').style.display = "block";
	document.getElementById('non-edit').style.display = "none";
	document.getElementById('edit').style.display = "block";
	document.getElementById('delete-btn').style.display = "block";
	
	nec = new NewEditClass(global_id);
	if(mc[global_id].logo != null)
	{
		nec.addLogo(mc[global_id].logo);
	}
	document.getElementById('rs-c1-e-title-field').value = mc[global_id].title;
	document.getElementById('rs-c2-e-username-field').value = mc[global_id].username;
	document.getElementById('rs-c2-e-password-field').value = mc[global_id].password;
	document.getElementById('rs-c3-e-url-field').value = mc[global_id].url;
	document.getElementById('rs-c4-e-te').value = mc[global_id].notes;
	if(mc[global_id].attachments != null)
	{
		for(let filename in mc[global_id].attachments) 
		{
			nec.addAttachment(mc[global_id].attachments[filename], filename);
		}
		nec.repaintAttachment();
	}
});

/* on-click delete button */
document.getElementById('delete-btn').addEventListener("click", function() {
	if(confirm('Are you sure you want to delete?')) 
	{
		block();
		postAjaxJson("backend/delete.php", global_id, (json_obj, error) => {
			if(!error)
			{
				if(json_obj['status'] == 0)		// re-login
				{
					reloginAlert();
				}
				else if(json_obj['status'] == 1)	//success
				{
					delete mc[global_id];
					document.getElementById('edit').style.display = "none";
					document.getElementById('cancel-btn').style.display = "none";
					document.getElementById('delete-btn').style.display = "none";
					document.getElementById('save-btn').style.display = "none";
					document.getElementById('created-on-text').innerHTML = "";
					cleanEditContainer();
					pls.paint();
				}
			}
			unblock();
		});
	} 
});

/* on-click cancel button */
document.getElementById('cancel-btn').addEventListener("click", function() {
	if(document.getElementById('save-btn').style.display == "block" && !confirm('Are you sure you want to exit without saving?'))
	{
		return;
	}
	readonlyView(global_id);
});

/* save button on click */
document.getElementById("save-btn").addEventListener("click", function() {
	block();
	nec.save();
});

/* on-click download(file) button */
function downloadFile(id, filename_encoded)
{
	let file_name = new TextDecoder().decode(new Uint8Array(String(filename_encoded).split(",").map((n) => { return Number(n) })));
	let link = document.createElement("a");
	link.href = URL.createObjectURL(new Blob([mc[id].attachments[file_name]]));
	link.download = file_name;
	link.click();
}


/* on-click add new entry button */
document.getElementById("add-btn").addEventListener("click", function() {
	if(document.getElementById('save-btn').style.display == "block" && !confirm('Are you sure you want to exit without saving?'))
	{
		return;
	}
	block();
	postAjaxJson("backend/utils/rows_used.php", "{}", (json_obj, error) => {	
		if(!error)
		{
			if(json_obj['status'] == 0)		// re-login
			{
				reloginAlert();
			}
			else if(json_obj['status'] == 1)	// success
			{
				if(json_obj['used_rows'] <= json_obj['max_rows'])
				{
					nec = new NewEditClass();
					document.getElementById("non-edit").style.display = "none";
					document.getElementById("edit").style.display = "block";
					document.getElementById("edit-btn").style.display = "none";
					document.getElementById("save-btn").style.display = "none";
					document.getElementById("delete-btn").style.display = "none";
					document.getElementById("cancel-btn").style.display = "block";
					document.getElementById('created-on-text').innerHTML = "";
					cleanEditContainer();
				}
				else
				{
					alert("Max no. of entries used (" + json_obj['used_rows'] + "/" + json_obj['max_rows'] + ").");
				}
			}
		}
		unblock();
	});
});

/* enable save button */
function enableSave()
{
	document.getElementById("save-btn").style.display = "block";
}

class EncodeClass
{
	constructor(id, logo, title, username, password, url, notes, attachments)
	{
		this.id = id;
		this.logo = logo;
		this.title = title;
		this.username = username;
		this.password = password;
		this.url = url;
		this.notes = notes;
		this.attachments = attachments;
	}
	
	encode()
	{
		let stream_list = [];
		let json_header = {};
		let start = 0;	// inclusive
		let end = 0;	// exclusive
		let temp;	// temporaty variable
		
		/* logo */
		if(this.logo != null)
		{
			temp = Array.from(new Uint8Array(this.logo));
			end += temp.length;
			stream_list = stream_list.concat(temp);
			json_header["logo"] = [start, end];
		}
		else
		{
			json_header["logo"] = null;
		}
		start = end;
		
		/* title */
		temp = Array.from(new TextEncoder().encode(this.title));
		end += temp.length;
		stream_list = stream_list.concat(temp);
		json_header["title"] = [start, end];
		start = end;
		
		/* username */
		temp = Array.from(new TextEncoder().encode(this.username));
		end += temp.length;
		stream_list = stream_list.concat(temp);
		json_header["username"] = [start, end];
		start = end;
		
		/* password */
		temp = Array.from(new TextEncoder().encode(this.password));
		end += temp.length;
		stream_list = stream_list.concat(temp);
		json_header["password"] = [start, end];
		start = end;
		
		/* url */
		temp = Array.from(new TextEncoder().encode(this.url));
		end += temp.length;
		stream_list = stream_list.concat(temp);
		json_header["url"] = [start, end];
		start = end;
		
		/* notes */
		temp = Array.from(new TextEncoder().encode(this.notes));
		end += temp.length;
		stream_list = stream_list.concat(temp);
		json_header["notes"] = [start, end];
		start = end;
		
		/* attachments */
		if(this.attachments != null)
		{
			let temp_arr1 = [];
			let temp_arr2 = [];
			for(let attachment in this.attachments) 
			{
				temp =  Array.from(new Uint8Array(new TextEncoder().encode(attachment)));
				end += temp.length;
				stream_list = stream_list.concat(temp);
				temp_arr1.push(start);
				temp_arr1.push(end);
				start = end;
				
				temp = Array.from(new Uint8Array(this.attachments[attachment]));
				end += temp.length;
				stream_list = stream_list.concat(temp);
				temp_arr2.push(start);
				temp_arr2.push(end);
				start = end;
			}
			json_header["attachments"] = {"file_names": temp_arr1, "files": temp_arr2};
		}
		else
		{
			json_header["attachments"] = null;
		}
		temp = null;
		
		let iv = crypto.getRandomValues(new Uint8Array(12));
		json_header["iv"] = Array.from(iv);
		
		postAjaxJson("backend/utils/leftover.php", "{}", (json_obj, error) => {	// get capacity
			if(!error)
			{
				if(json_obj['status'] == 0)		// re-login
				{
					reloginAlert();
					unblock();
				}
				else if(json_obj['status'] == 1)	// success
				{
					if((json_obj['max_capacity'] - json_obj['size_occupied']) >= stream_list.length) // valid capacity
					{
						encrypt(new Uint8Array(stream_list), iv).then((c) => {	// encrypt	
							setIdCookie(this.id);
							setHeaderCookie("1");
							postAjaxBinary("backend/insert.php", JSON.stringify(json_header), (bin_res, error) => {	// send header
								deleteHeaderCookie();
								if(!error)
								{
									bin_res = new Uint8Array(bin_res);
									if(bin_res[0] == 48)		// re-login
									{
										reloginAlert();
										deleteIdCookie();
										unblock();
									}
									else if(bin_res[0] == 49)	// success
									{
										let cipher_array =  new Uint8Array(c);
										let iter = Math.ceil(cipher_array.length / MAX_BYTES);
										if(iter == 1)	// single go
										{
											deleteAppendCookie();
											postAjaxBinary("backend/insert.php", cipher_array, (bin_res, error) => {
												if(!error)
												{
													bin_res = new Uint8Array(bin_res);
													if(bin_res[0] == 48)		// re-login
													{
														reloginAlert();
													}
													else if(bin_res[0] == 49)	// success
													{
														mc[this.id] = new MasterClass(this.id, this.logo, this.title, this.username, this.password, this.url, this.notes, this.attachments);
														pls.paint();
														document.getElementById("search").value = "";
														readonlyView(this.id);
													}
													deleteIdCookie();
													unblock();
												}
												else
												{
													deleteIdCookie();
													unblock();
												}
											});
										}
										else	// multiple go
										{
											this.postAjaxBinarySync(cipher_array, iter, 0, this.id, new MasterClass(this.id, this.logo, this.title, this.username, this.password, this.url, this.notes, this.attachments));
										}
									}
								}
								else
								{
									deleteIdCookie();
									unblock();
								}
							});			
						}, reason => {
							unblock();
						});
					}
					else
					{
						alert("Ran out of capacity.");
						unblock();
					}
				}
			}
			else
			{
				unblock();
			}
		});
	}
	
	postAjaxBinarySync(cipher_array, iter, start, id, mc_temp)
	{
		if(iter == 0)	// base condition
		{
			deleteIdCookie();
			deleteAppendCookie();
			mc[id] = mc_temp;
			pls.paint();
			document.getElementById("search").value = "";
			readonlyView(id);
			unblock();
			return;
		}
		if(iter == 1)	// last packet
		{
			setAppendCookie("2");
		}
		else	
		{
			setAppendCookie("1");	
		}
		postAjaxBinary("backend/insert.php", cipher_array.subarray(start, start + MAX_BYTES),  function(bin_res, error) {	
			if(!error)
			{
				bin_res = new Uint8Array(bin_res);
				if(bin_res[0] == 48)		// re-login
				{
					reloginAlert();
					deleteIdCookie();
					deleteAppendCookie();
					unblock();
				}
				else if(bin_res[0] == 49)	//success
				{
					start += MAX_BYTES;
					iter--;
					ec.postAjaxBinarySync(cipher_array, iter, start, id, mc_temp);
				}
			}
			else
			{
				deleteIdCookie();
				deleteAppendCookie();
				unblock();
			}
		});
	}
}

class DecodeClass
{
	constructor(encoded, header, id)
	{
		this.encoded = new Uint8Array(encoded);
		this.header = header;
		this.id = id;
	}
	
	decode()
	{
		let logo = null;
		if(this.header.logo != null)
		{
			logo = this.encoded.slice(this.header.logo[0], this.header.logo[1]).buffer;
		}
		let title = new TextDecoder().decode(this.encoded.slice(this.header.title[0], this.header.title[1]));
		let username = new TextDecoder().decode(this.encoded.slice(this.header.username[0], this.header.username[1]));
		let password = new TextDecoder().decode(this.encoded.slice(this.header.password[0], this.header.password[1]));
		let url = new TextDecoder().decode(this.encoded.slice(this.header.url[0], this.header.url[1]));
		let notes = new TextDecoder().decode(this.encoded.slice(this.header.notes[0], this.header.notes[1]));
		let attachments = null;
		if(this.header.attachments != null)
		{
			attachments = {};
			let file_names = this.header.attachments.file_names;
			let files = this.header.attachments.files;
			for(let i=0; i < file_names.length; i+=2)
			{
				let fn = new TextDecoder().decode(this.encoded.slice(this.header.attachments.file_names[i], this.header.attachments.file_names[i+1]));
				let f = this.encoded.slice(this.header.attachments.files[i], this.header.attachments.files[i+1]).buffer;
				attachments[fn] = f;
			}
		}
		mc[this.id] = new MasterClass(this.id, logo, title, username, password, url, notes, attachments);
	}
}


class NewEditClass
{
	constructor(id=null)
	{
		this.id = id;
		this.logo = null;
		this.attachments = null;
		
		this.attachmentFileNameList = [];
		this.attachmentFileArrayBufferDict = {};
	}
	
	addAttachment(file_arraybuffer, file_name)
	{
		if(this.attachmentFileNameList.includes(file_name))	// file is already present
		{
			alert("file(" + file_name + ") already exists.");
		}
		else	// new file
		{
			this.attachmentFileNameList.push(file_name);
			this.attachmentFileArrayBufferDict[file_name] = file_arraybuffer;
		}
	}
	
	repaintAttachment()
	{
		this.attachmentFileNameList.sort((a, b) => a.localeCompare(b, undefined, {sensitivity: 'base'}));
		let parent = document.getElementById("rs-c5-ac2-e-color");
		while(parent.firstChild) 
		{
			parent.firstChild.remove()
		}
		this.attachmentFileNameList.forEach(filename => {
			let filename_encoded = new TextEncoder().encode(filename).toString();
			let HTML = `
			<div class="rs-c5-e-a-row" id="${filename_encoded}">
				<div class="rs-c5-a-text">
					${filename}
				</div>
				<div class="rs-c5-a-icon" >
					<svg style="cursor: pointer;" onclick="nec.deleteAttachment('${filename_encoded}');" height='5vh' width='3vw' viewBox="0 0 50 50"><path d="M 21 2 C 19.354545 2 18 3.3545455 18 5 L 18 7 L 10 7 L 8 7 A 1.0001 1.0001 0 1 0 8 9 L 9 9 L 9 45 C 9 46.654 10.346 48 12 48 L 31.074219 48 C 30.523219 47.386 30.033187 46.718 29.617188 46 L 12 46 C 11.448 46 11 45.551 11 45 L 11 9 L 18.832031 9 A 1.0001 1.0001 0 0 0 19.158203 9 L 30.832031 9 A 1.0001 1.0001 0 0 0 31.158203 9 L 39 9 L 39 28.050781 C 39.331 28.023781 39.662 28 40 28 C 40.338 28 40.669 28.023781 41 28.050781 L 41 9 L 42 9 A 1.0001 1.0001 0 1 0 42 7 L 40 7 L 32 7 L 32 5 C 32 3.3545455 30.645455 2 29 2 L 21 2 z M 21 4 L 29 4 C 29.554545 4 30 4.4454545 30 5 L 30 7 L 20 7 L 20 5 C 20 4.4454545 20.445455 4 21 4 z M 18.984375 13.986328 A 1.0001 1.0001 0 0 0 18 15 L 18 40 A 1.0001 1.0001 0 1 0 20 40 L 20 15 A 1.0001 1.0001 0 0 0 18.984375 13.986328 z M 24.984375 13.986328 A 1.0001 1.0001 0 0 0 24 15 L 24 40 A 1.0001 1.0001 0 1 0 26 40 L 26 15 A 1.0001 1.0001 0 0 0 24.984375 13.986328 z M 31 14 C 30.447 14 30 14.448 30 15 L 30 33.371094 C 30.565 32.520094 31.242 31.753219 32 31.074219 L 32 15 C 32 14.448 31.553 14 31 14 z M 40 30 C 34.5 30 30 34.5 30 40 C 30 45.5 34.5 50 40 50 C 45.5 50 50 45.5 50 40 C 50 34.5 45.5 30 40 30 z M 40 32 C 44.4 32 48 35.6 48 40 C 48 44.4 44.4 48 40 48 C 35.6 48 32 44.4 32 40 C 32 35.6 35.6 32 40 32 z M 36.5 35.5 C 36.25 35.5 36.000781 35.600781 35.800781 35.800781 C 35.400781 36.200781 35.400781 36.799219 35.800781 37.199219 L 38.599609 40 L 35.800781 42.800781 C 35.400781 43.200781 35.400781 43.799219 35.800781 44.199219 C 36.200781 44.599219 36.799219 44.599219 37.199219 44.199219 L 40 41.400391 L 42.800781 44.199219 C 43.200781 44.599219 43.799219 44.599219 44.199219 44.199219 C 44.399219 43.999219 44.5 43.7 44.5 43.5 C 44.5 43.3 44.399219 43.000781 44.199219 42.800781 L 41.400391 40 L 44.199219 37.199219 C 44.399219 36.999219 44.5 36.7 44.5 36.5 C 44.5 36.3 44.399219 36.000781 44.199219 35.800781 C 43.799219 35.400781 43.200781 35.400781 42.800781 35.800781 L 40 38.599609 L 37.199219 35.800781 C 36.999219 35.600781 36.75 35.5 36.5 35.5 z"></path></svg>
				</div>
			</div>
			`;
			parent.innerHTML += HTML;	
		});
	}
	
	
	deleteAttachment(filename_encoded)
	{
		let file_name = new TextDecoder().decode(new Uint8Array(String(filename_encoded).split(",").map((n) => { return Number(n) })));
		let index = this.attachmentFileNameList.indexOf(file_name);
		if(index != -1)
		{
			this.attachmentFileNameList.splice(index, 1);
			delete this.attachmentFileArrayBufferDict[file_name];
			document.getElementById(filename_encoded).remove();
		}
	}
	
	addLogo(image_arraybuffer)
	{
		this.logo = image_arraybuffer;
		let blobUrl = URL.createObjectURL(new Blob([this.logo]));
		document.getElementById('rs-c1-e-logo').src = blobUrl;
	}
	
	deleteLogo()
	{
		this.logo = null;
		document.getElementById('rs-c1-e-logo').src = "images/edit.svg";
	}
	
	save()
	{
		let title = document.getElementById('rs-c1-e-title-field').value;
		let username = document.getElementById('rs-c2-e-username-field').value;
		let password = document.getElementById('rs-c2-e-password-field').value;
		let url = document.getElementById('rs-c3-e-url-field').value;
		let notes = document.getElementById('trix-input-1').value;
		if(NewEditClass.isNonEmptyDict(this.attachmentFileArrayBufferDict))
		{
			this.attachments = this.attachmentFileArrayBufferDict;
		}
		
		if(this.id === null)	// new 
		{
			//get id
			postAjaxJson("backend/utils/getid.php", "{}", (json_obj, error) => {	
				if(!error)
				{
					this.id = json_obj["id"];
					document.getElementById("add-btn").disabled = true;	//disable add button
					setTimeout(() => {
						document.getElementById("add-btn").disabled = false;
					}, 1000);	// re-enable add button after 1sec
					ec = new EncodeClass(this.id, this.logo, title, username, password, url, notes, this.attachments);	
					ec.encode();
				}
				else
				{
					unblock();
				}
			});
		}
		else	// edit
		{
			ec = new EncodeClass(this.id, this.logo, title, username, password, url, notes, this.attachments);	
			ec.encode();
		}
	}
	
	static isNonEmptyDict(dict)
	{
		for(let _ in dict) 
			return true; 
		return false;
	}
}

/* on-click edit logo */
document.getElementById("rs-c1-e-logo").addEventListener("click", function() {
	if(nec.logo === null)	// upload logo
	{
		document.getElementById("rs-c1-e-logo-hidden").click();
	}
	else	// delete logo
	{
		if(confirm('Are you sure you want to delete the logo?')) 
		{
			nec.deleteLogo();
		}
	}
});


/* hidden logo button */
document.getElementById("rs-c1-e-logo-hidden").onchange = async function(ev) {
	let fileList = ev.target.files;
	if(fileList.length == 1)
	{
		if(fileList[0].type.startsWith("image/"))	// only images
		{
			if(SUPPORTED_IMAGE_LIST.includes(fileList[0].type.toLowerCase())) // supported images
			{
				enableSave();
				await new Blob([fileList[0]]).arrayBuffer().then((arraybuffer) => {
					nec.addLogo(arraybuffer);
				});
			}
			else
			{
				alert("image("+ fileList[0].name +") not supported.");
			}
		}
	}
	this.value = null;	//select the same file again solution
}


/* Add attachment button */
document.getElementById("add-attachment-btn").addEventListener("click", function() {
	document.getElementById("add-attachment-btn-hidden").click();
});

/* hidden file button */
document.getElementById("add-attachment-btn-hidden").onchange = async function(ev) {
	block();
	enableSave();
    let fileList = ev.target.files;
	for(let i = 0; i < fileList.length; i++) 
	{
		await new Blob([fileList[i]]).arrayBuffer().then((arraybuffer) => {
			nec.addAttachment(arraybuffer, fileList[i].name);
		});
	}
	nec.repaintAttachment();
	this.value = null;	//select the same file again solution
	unblock();
}

/* files on drop */
function dropHandler(ev) 
{
	block();
	enableSave();
	document.getElementById("rs-c5-ac2-e-color").style.backgroundColor = 'transparent';
	ev.preventDefault();
	for(let i=0, inclusiveEnd=(ev.dataTransfer.items.length-1); i < ev.dataTransfer.items.length; i++) 
	{
		if(ev.dataTransfer.items[i].kind === 'file')
		{
			let entry = ev.dataTransfer.items[i].webkitGetAsEntry();
			if(entry.isFile) // if file uploaded
			{
				let file = ev.dataTransfer.items[i].getAsFile();
				dropHandlerSync(file, inclusiveEnd);
			}
			else if (entry.isDirectory) // if folder uploaded
			{
				alert("Folder(" + ev.dataTransfer.items[i].getAsFile().name + ") not allowed, upload files.");
				dropHandlerToDoLast(i, inclusiveEnd);
			}
			else 
			{
				dropHandlerToDoLast(i, inclusiveEnd);
			}
		}
		else
		{
			dropHandlerToDoLast(i, inclusiveEnd);
		}
	}
}

function dropHandlerToDoLast(present, end)
{
	if(present == end)
	{
		nec.repaintAttachment();
		unblock();
	}
}

async function dropHandlerSync(file, end)
{
	await new Blob([file]).arrayBuffer().then((arraybuffer) => {
		nec.addAttachment(arraybuffer, file.name);
	});
	if(end)
	{
		nec.repaintAttachment();
		unblock();
	}
}

/* files on drag */
function dragOverHandler(ev) 
{
	document.getElementById("rs-c5-ac2-e-color").style.backgroundColor = "#c7c7c7";
	ev.preventDefault();
}

/* files on drag leave */
document.addEventListener("dragleave", () => {
    document.getElementById("rs-c5-ac2-e-color").style.backgroundColor = 'transparent';
});

/* on click settings button */
document.getElementById("settings-btn").addEventListener("click", function() {
	document.getElementById("container2").style.display = "none";
	document.getElementById("container4-settings").style.display = "block";
});

/* right side(setting) container display to none */
function allSettingsDisplayToNone()
{
	document.getElementById("change-key-cont").style.display = "none";
	document.getElementById("delete-account-cont").style.display = "none";
	document.getElementById("stats-cont").style.display = "none";
	document.getElementById("contact-cont").style.display = "none";
}

/* on click change key */
document.getElementById("change-key").addEventListener("click", function() {
	allSettingsDisplayToNone();
	document.getElementById("change-key-cont").style.display = "flex";
});

/* on click delete account */
document.getElementById("delete-account").addEventListener("click", function() {
	allSettingsDisplayToNone();
	document.getElementById("delete-account-cont").style.display = "flex";
});

/* on click change encryption/decryption key */
document.getElementById("change-key-btn").addEventListener("click", function() {
	if(document.getElementById('save-btn').style.display != "block")
	{
		let key = document.getElementById("new-key").value;
		let account_password = document.getElementById("change-key-ap").value;
		if(key.length > 0 && account_password.length > 0)	// non-empty password
		{
			block();
			postAjaxJson("backend/change-key/create.php", JSON.stringify({"password": account_password}), (json_obj, error) => {	
				if(!error)
				{
					if(json_obj['status'] == 0)
					{
						reloginAlert();
						unblock();
					}
					else if(json_obj['status'] == 1)
					{
						digestAndImportKey(key).then((ck) => {	// importkey
							crypto_key = ck;
							let iv = crypto.getRandomValues(new Uint8Array(12));
							encrypt(SAMPLE_DATA, iv).then((c) => {	// encrypt
								setIdCookie("0");
								setHeaderCookie("1");
								postAjaxBinary("backend/change-key/insert.php", JSON.stringify({"iv": Array.from(iv)}), (bin_res, error) => {	// send header
									deleteHeaderCookie();
									if(!error)
									{
										bin_res = new Uint8Array(bin_res);
										if(bin_res[0] == 48)		// re-login
										{
											reloginAlert();
											deleteIdCookie();
											unblock();
										}
										else if(bin_res[0] == 49)	// success
										{
											postAjaxBinary("backend/change-key/insert.php", new Uint8Array(c), (bin_res, error) => {	
												deleteIdCookie();
												if(!error)
												{
													bin_res = new Uint8Array(bin_res);
													if(bin_res[0] == 48)	// re-login
													{
														reloginAlert();
														unblock();
													}
													else if(bin_res[0] == 49)	// success
													{
														encode_and_encrypt(Object.keys(mc).reverse());
													}
												}
												else
												{
													unblock();
												}
											});
										}
									}
									else
									{
										deleteIdCookie();
										unblock();
									}
								});
							}, reason => {
								unblock();
							});
						}, reason => {
							alert("import key error: " + reason); // Error!
							unblock();
						});
					}
					else if(json_obj['status'] == 2)
					{
						alert("Invalid account password");
						unblock();
					}
				}
				else
				{
					unblock();
				}
			});
		}
		else	//empty password
		{
			alert("Password can't be blank");
		}
	}
	else
	{
		alert("You can't perform this operation because of unsaved data.");
	}
});

function encode_and_encrypt(list_of_ids)
{
	if(list_of_ids.length == 0)	
	{
		postAjaxJson("backend/change-key/cleanup.php", "", (json_obj, error) => {
			if(!error)
			{
				if(json_obj['status'] == 0)
				{
					reloginAlert();
				}
				else if(json_obj['status'] == 1)
				{
					window.onbeforeunload = null;
					window.location.reload();
				}
			}
			unblock();
		});
		return;
	}
	
	let id = list_of_ids.pop();
	let stream_list = [];
	let json_header = {};
	let start = 0;	// inclusive
	let end = 0;	// exclusive
	let temp;	// temporaty variable
	
	/* logo */
	if(mc[id].logo != null)
	{
		temp = Array.from(new Uint8Array(mc[id].logo));
		end += temp.length;
		stream_list = stream_list.concat(temp);
		json_header["logo"] = [start, end];
	}
	else
	{
		json_header["logo"] = null;
	}
	start = end;
	
	/* title */
	temp = Array.from(new TextEncoder().encode(mc[id].title));
	end += temp.length;
	stream_list = stream_list.concat(temp);
	json_header["title"] = [start, end];
	start = end;
	
	/* username */
	temp = Array.from(new TextEncoder().encode(mc[id].username));
	end += temp.length;
	stream_list = stream_list.concat(temp);
	json_header["username"] = [start, end];
	start = end;
	
	/* password */
	temp = Array.from(new TextEncoder().encode(mc[id].password));
	end += temp.length;
	stream_list = stream_list.concat(temp);
	json_header["password"] = [start, end];
	start = end;
	
	/* url */
	temp = Array.from(new TextEncoder().encode(mc[id].url));
	end += temp.length;
	stream_list = stream_list.concat(temp);
	json_header["url"] = [start, end];
	start = end;
	
	/* notes */
	temp = Array.from(new TextEncoder().encode(mc[id].notes));
	end += temp.length;
	stream_list = stream_list.concat(temp);
	json_header["notes"] = [start, end];
	start = end;
	
	/* attachments */
	if(mc[id].attachments != null)
	{
		let temp_arr1 = [];
		let temp_arr2 = [];
		for(let attachment in mc[id].attachments) 
		{
			temp =  Array.from(new Uint8Array(new TextEncoder().encode(attachment)));
			end += temp.length;
			stream_list = stream_list.concat(temp);
			temp_arr1.push(start);
			temp_arr1.push(end);
			start = end;
			
			temp = Array.from(new Uint8Array(mc[id].attachments[attachment]));
			end += temp.length;
			stream_list = stream_list.concat(temp);
			temp_arr2.push(start);
			temp_arr2.push(end);
			start = end;
		}
		json_header["attachments"] = {"file_names": temp_arr1, "files": temp_arr2};
	}
	else
	{
		json_header["attachments"] = null;
	}
	temp = null;
	
	let iv = crypto.getRandomValues(new Uint8Array(12));
	json_header["iv"] = Array.from(iv);
	
	encrypt(new Uint8Array(stream_list), iv).then((c) => {	// encrypt	
		setIdCookie(id);
		setHeaderCookie("1");
		postAjaxBinary("backend/change-key/insert.php", JSON.stringify(json_header), (bin_res, error) => {	// send header
			deleteHeaderCookie();
			if(!error)
			{
				bin_res = new Uint8Array(bin_res);
				if(bin_res[0] == 48)		// re-login
				{
					reloginAlert();
					deleteIdCookie();
					unblock();
				}
				else if(bin_res[0] == 49)	// success
				{
					let cipher_array =  new Uint8Array(c);
					let iter = Math.ceil(cipher_array.length / MAX_BYTES);
					if(iter == 1)	// single go
					{
						deleteAppendCookie();
						postAjaxBinary("backend/change-key/insert.php", cipher_array, (bin_res, error) => {
							if(!error)
							{
								bin_res = new Uint8Array(bin_res);
								if(bin_res[0] == 48)		// re-login
								{
									reloginAlert();
								}
								else if(bin_res[0] == 49)	// success
								{
									encode_and_encrypt(list_of_ids);
								}
								deleteIdCookie();
							}
							else
							{
								deleteIdCookie();
								unblock();
							}
						});
					}
					else	// multiple go
					{
						multiple_go(cipher_array, iter, 0, id, list_of_ids);
					}
				}
			}
			else
			{
				deleteIdCookie();
				unblock();
			}
		});			
	}, reason => {
		unblock();
	});	
}

function multiple_go(cipher_array, iter, start, id, list_of_ids)
{
	if(iter == 0)	
	{
		deleteIdCookie();
		deleteAppendCookie();	
		return encode_and_encrypt(list_of_ids);
	}
	
	if(iter == 1)	// last packet
	{
		setAppendCookie("2");
	}
	else	
	{
		setAppendCookie("1");	
	}
	postAjaxBinary("backend/change-key/insert.php", cipher_array.subarray(start, start + MAX_BYTES),  function(bin_res, error) {	
		if(!error)
		{
			bin_res = new Uint8Array(bin_res);
			if(bin_res[0] == 48)		// re-login
			{
				reloginAlert();
				deleteIdCookie();
				deleteAppendCookie();
				unblock();
			}
			else if(bin_res[0] == 49)	//success
			{
				start += MAX_BYTES;
				iter--;
				multiple_go(cipher_array, iter, start, id, list_of_ids);
			}
		}
		else
		{
			deleteIdCookie();
			deleteAppendCookie();
			unblock();
		}
	});
}


/* on click delete account btn */
document.getElementById("delete-account-btn").addEventListener("click", function() {
	let account_password = document.getElementById("delete-account-ap").value;
	if(account_password.length > 0)	// non-empty password
	{
		block();
		postAjaxJson("backend/delete-acct/delete.php", JSON.stringify({"password": account_password}), (json_obj, error) => {	
			if(!error)
			{
				if(json_obj['status'] == 0)
				{
					reloginAlert();
					unblock();
				}
				else if(json_obj['status'] == 1)
				{
					cleanup();
				}
				else if(json_obj['status'] == 2)
				{
					alert("Invalid account password");
					unblock();
				}
			}
			unblock();
		});
						
	}
	else	//empty password
	{
		alert("Password can't be blank");
	}
});

function cleanup()
{
	document.addEventListener('copy', function(e) {		// clear clipboard
		e.clipboardData.setData('text/plain', '');
		e.preventDefault();
	});
	document.execCommand('copy');
	deleteIdCookie();
	deleteAppendCookie();
	deleteHeaderCookie();
	window.onbeforeunload = null;
	window.location.reload();
}

/* on click logoff button */
function  logoff() 
{
	if(document.getElementById('save-btn').style.display == "block" && !confirm('Are you sure you want to logoff without saving?'))
	{
		return;
	}
	block();
	postAjaxJson("backend/logoff.php", "", (json_obj, error) => {	// logoff
		if(!error)
		{
			if(json_obj['status'] == 0)
			{
				reloginAlert();
			}
			else if(json_obj['status'] == 1)	// success
			{
				postAjaxJson("backend/utils/cleanup.php", "{}", (json_obj, error) => {});	//clean up call
				cleanup();
			}
		}
		unblock();
	});
}


/* on click donation button */
document.getElementById("donation").addEventListener("click", function() {
	let link = document.createElement("a");
	link.href = "donation.html";
	link.target = "_blank";
	link.click();
});

/* on click show stats button */
document.getElementById("stats").addEventListener("click", function() {
	allSettingsDisplayToNone();
	document.getElementById("stats-cont").style.display = "flex";
	block();
	postAjaxJson("backend/utils/leftover.php", "{}", (json_obj, error) => {	
		if(!error)
		{
			if(json_obj['status'] == 0)		// re-login
			{
				reloginAlert();
				unblock();
			}
			else if(json_obj['status'] == 1)	// success
			{
				document.getElementById("max-size").innerHTML = json_obj['max_capacity'] / 1024 / 1024;
				document.getElementById("size-occ").innerHTML = json_obj['size_occupied'] / 1024 / 1024;
				document.getElementById("free-size").innerHTML = (json_obj['max_capacity'] - json_obj['size_occupied']) / 1024 / 1024;
				postAjaxJson("backend/utils/rows_used.php", "{}", (json_obj, error) => {	
					if(!error)
					{
						if(json_obj['status'] == 0)		// re-login
						{
							reloginAlert();
						}
						else if(json_obj['status'] == 1)	// success
						{
							document.getElementById("max-entries").innerHTML = json_obj['max_rows'];
							document.getElementById("entries-used").innerHTML = json_obj['used_rows'];
						}
					}
					unblock();
				});
			}
		}
		else
		{
			unblock();
		}
	});
});

/* on click contact button */
document.getElementById("contact").addEventListener("click", function() {
	allSettingsDisplayToNone();
	document.getElementById("contact-cont").style.display = "flex";
});

/* on click back arrow in settings */
document.getElementById("settings-back").addEventListener("click", function() {
	allSettingsDisplayToNone();
	document.getElementById("container4-settings").style.display = "none";
	document.getElementById("container2").style.display = "block";
});


/* on page reload/navigate popup warning */
window.onbeforeunload = function() {
  return "Changes you made may not be saved.";
};


/* on-click forgot decryption password */
if(document.getElementById("forgot-decrypt-password"))
{
	document.getElementById("forgot-decrypt-password").addEventListener("click", function() {
		document.getElementById("container1").style.display = "none";
		document.getElementById("container3-forgot-decryption-password").style.display = "flex";
	});
}

/* Reset encryption password */
document.getElementById("c3-reset").addEventListener("click", function() {
	if(document.getElementById("c3-password").value == "")
	{
		alert("Password can't be blank.");
		return;
	}
	block();
	let json = JSON.stringify({"password": document.getElementById("c3-password").value});
	postAjaxJson("backend/reset-key/reset.php", json, (json_obj, error) => {	// get capacity
		if(!error)
		{
			if(json_obj['status'] == 0)
			{
				reloginAlert();
			}
			else if(json_obj['status'] == 1)	// success
			{
				window.onbeforeunload = null;
				window.location.reload();
			}
			else if(json_obj['status'] == 2)	// invalid password
			{
				alert("Invalid Password!");
				document.getElementById("c3-password").value = "";
			}
		}
		unblock();
	});
});


/* Disable tab in trix-editor */
document.getElementById("rs-c4-e-te").addEventListener("keydown", function(key) {
	if(key.keyCode == 9)
	{
		key.preventDefault();
	}
});

/* When user pressed enter on password field */
if(document.getElementById("c1-key"))
{
	document.getElementById("c1-key").addEventListener("keydown", function(key) {
		if(key.keyCode == 13)
		{
			document.getElementById("c1-submit").click();
		}
	});
}

/* trix disable insert file */
document.addEventListener("trix-file-accept",(e)=>{e.preventDefault();});

/* online hide image */
window.addEventListener('online', () => { document.getElementById("offline").style.display = "none"; });

/* onffline display image */
window.addEventListener('offline', () => { document.getElementById("offline").style.display = "block"; });
