<?php session_start(); ?>
<?php
	if(isset($_POST['login_email']) && filter_var($_POST['login_email'], FILTER_VALIDATE_EMAIL) && isset($_POST['login_password']) && isset($_POST['login_code']) && isset($_POST['resend_code']) && isset($_POST['captcha_code']))
	{
		$email = $_POST['login_email'];
		$password = $_POST['login_password'];
		$code = $_POST['login_code'];
		$resend_code = $_POST['resend_code'];
		
		if(mb_strlen($email, "UTF-8") < 257 && mb_strlen($password, "UTF-8") < 257 && mb_strlen($code, "UTF-8") < 7 && mb_strlen($resend_code, "UTF-8") < 2)
		{
			require '../../database.php';
			$conn = mysqli_connect($dbservername, $dbusername, $dbpassword, $dbname);
			$sql = "SELECT status, otp, otp_expiry, otp_failure_attempts FROM user_details WHERE email='$email'";
			$result = mysqli_query($conn, $sql);
			if($result && mysqli_num_rows($result) == 1) // valid email
			{
				$row = mysqli_fetch_assoc($result);
				if($row["status"] == 0 || $row["status"] == 2)
				{	
					require '../../hash.php';
					require '../../time.php';
					$password = hash_pbkdf2($hash_alg, $salt_f . $password . $salt_r, NULL, $iterations);
					if($resend_code == 0)	// user clicked on submit button
					{
						if(time_placeholder() < $row["otp_expiry"]) // otp didn't expired
						{
							$code = hash_pbkdf2($hash_alg, $salt_f . $code . $salt_r, NULL, $iterations);
							if($row["otp"] == $code)	// valid otp
							{
								$sql = "SELECT email FROM user_details WHERE email='$email' and password='$password'";
								$result = mysqli_query($conn, $sql);
								if($result && mysqli_num_rows($result) == 1) // valid user
								{
									require '../../JWT/JWT.php';
									require '../../jwt_key.php';
									$rand_id = bin2hex(random_bytes(16));
									$payload = array(
										"id" => $rand_id,
										"email" => $email
									);
									$jwt = JWT::encode($payload, $key, $alg);
									if(mysqli_query($conn, "UPDATE user_details SET status=1, otp=0, otp_expiry=0, otp_failure_attempts=0, login_failure_attempts=0, jwt_id='$rand_id' WHERE email='$email'"))
									{
										echo '{"status":1, "jwt":"'. $jwt .'"}';
									}
								}
								else	//invalid password
								{
									echo '{"status":5}';
								}
							}
							else	// invalid otp
							{
								$attempts = $row["otp_failure_attempts"];
								if($attempts < 9)	// invalid otp but valid attempts
								{
									$attempts++;
									if(mysqli_query($conn, "UPDATE user_details SET otp_failure_attempts=$attempts WHERE email='$email'"))
									{
										echo '{"status":2}';
									}
								}
								else	// invalid otp and attempts
								{
									echo '{"status":3}';
								}
							}
						}
						else	// otp did expired
						{
							echo '{"status":4}';
						}
					}
					else	// user clicked on resend otp button
					{
						require '../securimage/securimage.php';
						$securimage = new Securimage();
						if($securimage->check($_POST['captcha_code']) == false)   // invalid cacptcha don't resend email
						{
							echo '{"status":2}';
						}
						else	// valid captcha resend email
						{
							require '../../otp.php';
							$otp = otp_0();
							$otp_expiry = time_placeholder() + 3600;
							$otp_hashed = hash_pbkdf2($hash_alg, $salt_f . $otp . $salt_r, NULL, $iterations);
							if(mysqli_query($conn, "UPDATE user_details SET otp='$otp_hashed', otp_expiry =$otp_expiry, otp_failure_attempts=0 WHERE email='$email'"))
							{
								$ip = $_SERVER['REMOTE_ADDR'];
								require '../../email.php';
								$url = trim(file_get_contents('../../URL.txt'));
								$sub = "";
								if($row["status"] == 0) //resend otp for singup
								{
									$body = file_get_contents('../../email_templates/template1.txt') . $url . file_get_contents('../../email_templates/template2.txt') . "registering" . file_get_contents('../../email_templates/template3.txt') . $otp . file_get_contents('../../email_templates/template4.txt') . "sign up" . file_get_contents('../../email_templates/template5.txt') . $ip . file_get_contents('../../email_templates/template6.txt') . $reply_to . file_get_contents('../../email_templates/template7.txt') . $url . file_get_contents('../../email_templates/template8.txt') . $url . file_get_contents('../../email_templates/template9.txt');
									$sub = "Welcome to Password Manager";
								}
								else	//resend otp for multiple login
								{
									$body = file_get_contents('../../email_templates/template1.txt') . $url . file_get_contents('../../email_templates/template2.txt') . "login" . file_get_contents('../../email_templates/template3.txt') . $otp . file_get_contents('../../email_templates/template4.txt') . "multiple login" . file_get_contents('../../email_templates/template5.txt') . $ip . file_get_contents('../../email_templates/template6.txt') . $reply_to . file_get_contents('../../email_templates/template7.txt') . $url . file_get_contents('../../email_templates/template8.txt') . $url . file_get_contents('../../email_templates/template9.txt');
									$sub = "Reactivate Account";
								}
								mail($email, $sub, $body, $headers);
								echo '{"status":1}';
							}
						}
					}
				}
			}
			else	// invalid user
			{
				echo '{"status":0}';
			}
			mysqli_close($conn);
		}
	}
?>	