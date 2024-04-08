<!DOCTYPE html>
<html lang="en">
<?php
	if(isset($_COOKIE['jwt']) && $_COOKIE['jwt'] != "")
	{
		$jwt = $_COOKIE['jwt'];
		require '../JWT/JWT.php';
		require '../jwt_key.php';
		try
		{
			$decoded = JWT::decode($jwt, $key, array($alg));
			require '../database.php';
			$conn = mysqli_connect($dbservername, $dbusername, $dbpassword, $dbname);
			$sql = "SELECT jwt_id FROM user_details WHERE email='". $decoded->email ."' and jwt_id='". $decoded->id ."'";
			$result = mysqli_query($conn, $sql);
			if($result && mysqli_num_rows($result) > 0) // valid user
			{
				if(mysqli_query($conn, "USE $dbname_user"))
				{
					$sql = "SHOW TABLES LIKE '". $decoded->email ."'";
					$result = mysqli_query($conn, $sql);
			?>
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Password Manager</title>
				<link rel="icon" href='../1_entry/images/icon.svg'>
				<link rel="stylesheet" href='css/passman.css' />
				<link rel="stylesheet" href="css/trix.css">
				<link href='https://fonts.googleapis.com/css?family=Hind:300' rel='stylesheet' />
				<link href='https://fonts.googleapis.com/css?family=Open+Sans+Condensed:300' rel='stylesheet' />
				<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap" rel="stylesheet">
			</head>
			<body>
				<svg id="offline" title="offline" fill="#ffffff" viewBox="0 0 100 100"><path d="M86,19L96.2,8.8c1.4-1.4,1.4-3.6,0-5c-1.4-1.4-3.6-1.4-5,0L3.8,91.2c-1.4,1.4-1.4,3.6,0,5c0.7,0.7,1.6,1,2.5,1  s1.8-0.3,2.5-1L19,86c8.3,7.2,19.2,11.5,31,11.5c26.2,0,47.5-21.3,47.5-47.5C97.5,38.2,93.1,27.3,86,19z M85.5,30.6H74.3L81,24  C82.7,26.1,84.2,28.3,85.5,30.6z M67,50c0,4.4-0.3,8.5-0.8,12.3H42.7l23.6-23.6C66.7,42.2,67,46,67,50z M24,81l5.6-5.6  c1.5,4.7,3.4,8.9,5.6,12.2C31.1,86,27.3,83.7,24,81z M50,90.5c-5.6,0-11.6-8-14.7-20.8l0.4-0.4h29.2C61.7,82.4,55.6,90.5,50,90.5z   M64.8,87.6c3.1-4.8,5.6-11,7.2-18.3h13.5C81,77.6,73.7,84.1,64.8,87.6z M73.3,62.3c0.5-3.9,0.8-8,0.8-12.3s-0.3-8.4-0.8-12.3h15.3  c1.2,3.9,1.9,8,1.9,12.3s-0.7,8.4-1.9,12.3H73.3z"></path><path d="M15.9,71.7c-0.5-0.8-1-1.5-1.4-2.3h3.7l7-7H11.5c-1.2-3.9-1.9-8-1.9-12.3s0.7-8.4,1.9-12.3h15.3c-0.5,3.9-0.8,8-0.8,12.3  c0,3.8,0.2,7.5,0.6,11l6.5-6.5C33,53,33,51.5,33,50c0-4.4,0.3-8.5,0.8-12.3h16l7-7H35.2c3.1-13,9.2-21.1,14.8-21.1  c4.7,0,9.7,5.6,13,15l5.4-5.4c-1.1-2.5-2.3-4.8-3.6-6.8c2.4,0.9,4.7,2.1,6.9,3.5l5.1-5.1C69.1,5.6,59.9,2.5,50,2.5  C23.8,2.5,2.5,23.8,2.5,50c0,9.9,3.1,19.1,8.3,26.8L15.9,71.7z M35.2,12.4c-3.1,4.8-5.6,11-7.2,18.3H14.5  C19,22.4,26.3,15.9,35.2,12.4z"></path></svg>
				<noscript><span id="noscript_text">Please enable JavaScript in your browser.</span></noscript>
				<div id="container1">
					<div id="top-bar">
						<div class="btn-style2" onclick="window.open('../help.pdf', '_blank').focus();">Help</div>
						<div id="logoff-btn" onclick="logoff();">Log off</div>
					</div>
				<?php
					if($result && mysqli_num_rows($result) == 1)	// existing user
					{
						?>
						<div class="heading-style1">Decryption Password</div>
						<div class="c1-password-container">
							<input type="password" class="c1-password" id="c1-key" placeholder="Decryption Password" title="Decryption Password" autofocus />
							<button type="button" class="c1-submit" id="c1-submit" tabindex="-1">Submit</button>
						</div>
						<div style="display: flex; height: 50%; justify-content: center; align-items: flex-end; color: rgba(255,255,255,.8); font-family: Arial, sans-serif; font-size: 2.5vh;">
							<span id="forgot-decrypt-password" style="cursor: pointer;">Forgot password?</span>
						</div>
						<?php
					}
					else if($result  && mysqli_num_rows($result) == 0)	// new user
					{
						?>
						<div class="heading-style1">Create Encryption/Decryption Password</div>
						<div class="c1-password-container">
							<input type="password" class="c1-password" id="c1-new-user-key" placeholder="Encryption/Decryption Password" title="Encryption/Decryption Password" autofocus />
							<button type="button" class="c1-submit" id="c1-new-user-submit" tabindex="-1">Submit</button>
						</div>
						<div class="warning-style">
							<span style="color:red;">Warning</span>: The first(previous page) login password is used to verify the identity of the user(you). The second(current page) password is an encryption/decryption password that Password Manager(we) does not have access to. It is used to encrypt/decrypt data on your device; we do not have access to the decrypted data or your encryption/decryption password. <span style="color:#ff5757;">This also means we cannot perform an encryption/decryption password recovery.</span> If you forget your encryption/decryption password, we will not be able to recover your data.
						</div>
						<?php
					}
				?>
				</div>
				<div id="container2">
					<div id="top-bar">
						<div id="donation" class="btn-style2"><img style="height: 80%;" src="images/donate.png" /></div>
						<div class="btn-style2" onclick="window.open('../help.pdf', '_blank').focus();">Help</div>
						<div id="settings-btn" class="btn-style2">Settings</div>
						<div id="logoff-btn" onclick="logoff();">Log off</div>
					</div>
					<div id="middle-section" >
						<div id="middle-r1">
							<div id="top-left-section">
								<div id="search-box">
									<svg id="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px" fill=#9aa0a6><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
									<input type="text" id="search" placeholder="Search" autocomplete="off" spellcheck="false" />
								</div>
								<button type="button" id="add-btn"></button>
							</div>
							<div id="top-right-section">
								<div id="to-left">
									<button type="button" class="btn-style1" id="edit-btn">Edit</button>
									<button type="button" class="btn-style1" id="cancel-btn">Cancel</button>
								</div>
								<div id="to-right">
									<button type="button" class="btn-style1" id="save-btn">Save</button>
									<svg id="delete-btn" viewBox="0 0 50 50"><path d="M 21 2 C 19.354545 2 18 3.3545455 18 5 L 18 7 L 10 7 L 8 7 A 1.0001 1.0001 0 1 0 8 9 L 9 9 L 9 45 C 9 46.654 10.346 48 12 48 L 31.074219 48 C 30.523219 47.386 30.033187 46.718 29.617188 46 L 12 46 C 11.448 46 11 45.551 11 45 L 11 9 L 18.832031 9 A 1.0001 1.0001 0 0 0 19.158203 9 L 30.832031 9 A 1.0001 1.0001 0 0 0 31.158203 9 L 39 9 L 39 28.050781 C 39.331 28.023781 39.662 28 40 28 C 40.338 28 40.669 28.023781 41 28.050781 L 41 9 L 42 9 A 1.0001 1.0001 0 1 0 42 7 L 40 7 L 32 7 L 32 5 C 32 3.3545455 30.645455 2 29 2 L 21 2 z M 21 4 L 29 4 C 29.554545 4 30 4.4454545 30 5 L 30 7 L 20 7 L 20 5 C 20 4.4454545 20.445455 4 21 4 z M 18.984375 13.986328 A 1.0001 1.0001 0 0 0 18 15 L 18 40 A 1.0001 1.0001 0 1 0 20 40 L 20 15 A 1.0001 1.0001 0 0 0 18.984375 13.986328 z M 24.984375 13.986328 A 1.0001 1.0001 0 0 0 24 15 L 24 40 A 1.0001 1.0001 0 1 0 26 40 L 26 15 A 1.0001 1.0001 0 0 0 24.984375 13.986328 z M 31 14 C 30.447 14 30 14.448 30 15 L 30 33.371094 C 30.565 32.520094 31.242 31.753219 32 31.074219 L 32 15 C 32 14.448 31.553 14 31 14 z M 40 30 C 34.5 30 30 34.5 30 40 C 30 45.5 34.5 50 40 50 C 45.5 50 50 45.5 50 40 C 50 34.5 45.5 30 40 30 z M 40 32 C 44.4 32 48 35.6 48 40 C 48 44.4 44.4 48 40 48 C 35.6 48 32 44.4 32 40 C 32 35.6 35.6 32 40 32 z M 36.5 35.5 C 36.25 35.5 36.000781 35.600781 35.800781 35.800781 C 35.400781 36.200781 35.400781 36.799219 35.800781 37.199219 L 38.599609 40 L 35.800781 42.800781 C 35.400781 43.200781 35.400781 43.799219 35.800781 44.199219 C 36.200781 44.599219 36.799219 44.599219 37.199219 44.199219 L 40 41.400391 L 42.800781 44.199219 C 43.200781 44.599219 43.799219 44.599219 44.199219 44.199219 C 44.399219 43.999219 44.5 43.7 44.5 43.5 C 44.5 43.3 44.399219 43.000781 44.199219 42.800781 L 41.400391 40 L 44.199219 37.199219 C 44.399219 36.999219 44.5 36.7 44.5 36.5 C 44.5 36.3 44.399219 36.000781 44.199219 35.800781 C 43.799219 35.400781 43.200781 35.400781 42.800781 35.800781 L 40 38.599609 L 37.199219 35.800781 C 36.999219 35.600781 36.75 35.5 36.5 35.5 z"></path></svg>
								</div>
							</div>
						</div>
						<div id="middle-r2">
							<div id="left-section">
								<div class="left-section-container-style" id="left-section-container">
									<!--dynamic list of logo(s) and title(s)-->
								</div>
							</div>
							<div class="right-section">
								<div id="non-edit">
									<div class="rs-c1">
										<div class="rs-c1-logo-container">
											<img src="../1_entry/images/icon.svg" class="rs-c1-logo" id="rs-c1-ne-logo" />
										</div>	
										<div id="rs-c1-ne-title"></div>
									</div>
									<div class="rs-c2">
										<div class="rs-c2-up">
											<div id="rs-c2-ne-u">username</div>
											<div id="rs-c2-ne-ut"></div>
											<div id="rs-c2-ne-p">
												<div id="rs-c2-ne-pp">
														password
												</div>
												<div id="rs-c2-ne-p-eye">
													<img src="images/eye-open.png" id="rs-c2-ne-p-eye-open" alt="show" />
													<img src="images/eye-close.png" id="rs-c2-ne-p-eye-close" alt="hide" />
												</div>
											</div>
											<div id="rs-c2-ne-pt"></div>
										</div>
									</div>
									<div class="rs-c3">
										<div id="rs-c3-ne-w">Website</div>
										<div id="rs-c3-ne-wn"></div>
									</div>
									<div id="rs-c4-ne">
										<div class="rs-c4-nt">Notes</div>
										<div id="rs-c4-ne-tec">
											<div id="rs-c4-ne-te"></div>
										</div>
									</div>
									<div id="padding-buffer"></div>
									<div class="rs-c5">
										<div id="rs-c5-ne-at">Attachments</div>
										<div class="rs-c5-ac1">
											<div class="rs-c5-ac2" id="rs-c5-ac2-dyn-files">
												<!--dynamic files-->
											</div>
										</div>
									</div>
								</div>
								<div id="edit">
									<div class="rs-c1">
										<div class="rs-c1-logo-container">
											<img src="images/edit.svg" class="rs-c1-logo" id="rs-c1-e-logo" />
											<input type="file" id="rs-c1-e-logo-hidden" accept="image/*" hidden />
										</div>
										<div id="rs-c1-e-title">
											<input id="rs-c1-e-title-field" type="text" placeholder="Title" autocomplete="off" oninput="enableSave()" />
										</div>
									</div>
									<div class="rs-c2">
										<div class="rs-c2-up">
											<div id="rs-c2-e-u">username</div>
											<div id="rs-c2-e-ut">
												<input id="rs-c2-e-username-field" type="text" placeholder="username" autocomplete="off" spellcheck="false" size="50" oninput="enableSave()"  />
											</div>
											<div id="rs-c2-e-p">password</div>
											<div id="rs-c2-e-pt">
												<input id="rs-c2-e-password-field" type="text" placeholder="password" autocomplete="off" spellcheck="false" size="50" oninput="enableSave()" />
											</div>
										</div>
									</div>
									<div class="rs-c3">
										<div id="rs-c3-e-w">Website</div>
										<div id="rs-c3-e-wn">
											<input id="rs-c3-e-url-field" type="text" placeholder="url" autocomplete="off" spellcheck="false" size="70" oninput="enableSave()" />
										</div>
									</div>
									<div id="rs-c4-e">
										<div class="rs-c4-nt" id="rs-c4-e-nt">Notes</div>
										<div id="rs-c4-e-tec1">
											<div id="rs-c4-e-tec2">
												<trix-editor id="rs-c4-e-te" oninput="enableSave()"></trix-editor>
											</div>
										</div>
									</div>
									<div id="padding-buffer"></div>
									<div class="rs-c5" id="rs-c5-e">
										<div id="rs-c5-e-at">
											<div id="rs-c5-e-att">
												Attachments
											</div>
											<div id="rs-c5-e-ab">
												<button type="button" class="btn-style1" id="add-attachment-btn">Add</button>
												<input type="file" id="add-attachment-btn-hidden" multiple hidden />
											</div>
										</div>
										<div class="rs-c5-ac1" id="rs-c5-e-ac1">
											<div class="rs-c5-ac2" id="rs-c5-ac2-e-color" ondrop="dropHandler(event);" ondragover="dragOverHandler(event);">
												<!--dynamic list of files-->
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div id="bottom-bar">
						<div id="created-on-text"></div>
					</div>
				</div>
				<div id="container3-forgot-decryption-password">
					<div id="top-bar">
						<div class="btn-style2" onclick="window.open('../help.pdf', '_blank').focus();">Help</div>
						<div id="logoff-btn" onclick="logoff();">Log off</div>
					</div>
					<div class="heading-style1">Reset Encryption/Decryption Password</div>
						<div class="c1-password-container">
							<input type="password" class="c1-password" id="c3-password" placeholder="Account Password" title="Account Password" tabindex="-1" />
							<button type="button" class="c1-submit" id="c3-reset" tabindex="-1">Delete</button>
						</div>
						<div class="warning-style">
							<span style="color:red;">Warning</span>: You are about to delete all your encrypted data(current page) and create a new encryption/decryption password(next page). Please provide the account password(login password) before deleting and creating new one.
						</div>
					</div>
				</div>
				<div id="container4-settings">
					<div id="top-bar" style="justify-content: flex-start;">												
						<svg id="settings-back" xmlns="http://www.w3.org/2000/svg" fill="#ffffff" viewBox="0 0 50 50" width="24px" height="24px"><path d="M 25 2 C 12.316406 2 2 12.316406 2 25 C 2 37.683594 12.316406 48 25 48 C 37.683594 48 48 37.683594 48 25 C 48 12.316406 37.683594 2 25 2 Z M 37 26 L 15.414063 26 L 21.707031 32.292969 C 22.097656 32.683594 22.097656 33.316406 21.707031 33.707031 C 21.511719 33.902344 21.257813 34 21 34 C 20.742188 34 20.488281 33.902344 20.292969 33.707031 L 12.292969 25.707031 C 12.199219 25.613281 12.128906 25.503906 12.078125 25.382813 C 11.976563 25.136719 11.976563 24.863281 12.078125 24.617188 C 12.128906 24.496094 12.199219 24.386719 12.292969 24.292969 L 20.292969 16.292969 C 20.683594 15.902344 21.316406 15.902344 21.707031 16.292969 C 22.097656 16.683594 22.097656 17.316406 21.707031 17.707031 L 15.414063 24 L 37 24 C 37.554688 24 38 24.449219 38 25 C 38 25.550781 37.554688 26 37 26 Z"></path></svg>
						<div style="display: flex; width: -webkit-fill-available; width: -moz-available; justify-content: flex-end;">
							<div id="logoff-btn" onclick="logoff();">Log off</div>
						</div>
					</div>
					<div id="middle-c4">
						<div id="left-section-settings">
							<div class="left-section-container-style">
								<div class="l-s-style-settings" id="stats">stats</div>
								<div class="l-s-style-settings" id="change-key">change key</div>
								<div class="l-s-style-settings" id="delete-account">delete account</div>
								<div class="l-s-style-settings" onclick="document.getElementById('donation').click();">donate</div>
								<div class="l-s-style-settings" onclick="window.open('../help.pdf', '_blank').focus();">help</div>
								<div class="l-s-style-settings" id="contact">contact</div>
							</div>
						</div>
						<div class="right-section-settings" id="r-s-s">
							<div class="right-side-settings-style1" style="align-items: flex-start" id="stats-cont">
								<div class="heading-style2"><b>CAPACITY</b></div>
								<div class="heading-style2">Maximum Size: <span id="max-size"></span>(MiB)</div>
								<div class="heading-style2">Size Occupied: <span id="size-occ"></span>(MiB)</div>
								<div class="heading-style2">Free Size: <span id="free-size"></span>(MiB)</div>
								<div class="heading-style2"><b>ENTRIES</b></div>
								<div class="heading-style2">Maximum entries: <span id="max-entries"></span></div>
								<div class="heading-style2">entries used: <span id="entries-used"></span></div>
							</div>
							<div class="right-side-settings-style1" id="change-key-cont">
								<div class="heading-style1">Change Encryption/Decryption Password</div>
								<input type="password" class="input-style1" id="new-key" placeholder="New Encryption/Decryption Password"  title="New Encryption/Decryption Password" />
								<input type="password" class="input-style1" id="change-key-ap" placeholder="Account Password"  title="Account Password" />
								<button type="button" id="change-key-btn">Change</button>
							</div>
							<div class="right-side-settings-style1" id="delete-account-cont">
								<div class="heading-style1">Delete Account</div>	
								<input type="password" class="input-style1" id="delete-account-ap" placeholder="Account Password"  title="Account Password" />
								<button type="button"id="delete-account-btn"  tabindex="-1">Delete my Account</button>
								<div class="warning-style">
									Warning! Once you delete your account, there's no going back. Make sure you want to do this.
								</div>
							</div>
							<div class="right-side-settings-style1" id="contact-cont">
								<div id="contact-cont-email">
									email: psaisathvikrao@gamil.com
								</div>
								<div style="display: flex;">
									<a href="https://github.com/Sathvik-Rao" target="_blank" style="color: white; margin: 4%;">GitHub</a>
									<a href="http://www.linkedin.com/in/sathvikraopoladi" target="_blank" style="color: white; margin: 4%;">LinkedIn</a>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<!-- Loading widget(rotating pies) -->
				<div class="loadingio-spinner-wedges-091xl806lm9i" id="loading">
					<div class="ldio-iqr1yvo502e">
						<div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div></div>
					</div>
				</div>
	
				<script src='../1_entry/js/jquery-3.6.0.min.js'></script>
				<script src='../1_entry/js/jquery.blockUI.min.js'></script>
				<script src="js/trix.js"></script>
				<script src='js/passman.js'></script>
			</body>
			<?php
				}
			}
			else
			{
				echo '<head><script>document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"; window.open("../2_manager/passman.php", "_self");</script></head>';
			}
		}
		catch(SignatureInvalidException | UnexpectedValueException | DomainException $e)	// invalid signature
		{
			echo '<head><script>document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"; window.open("../2_manager/passman.php", "_self");</script></head>';
		}
	}
	else	//jwt cookie not set
	{
		echo '<head><meta http-equiv="refresh" content="0; url=../1_entry/entry.html" /></head>';
	}
?>
</html>