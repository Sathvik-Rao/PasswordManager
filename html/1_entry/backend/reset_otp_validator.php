<?php session_start(); ?>
<?php
	if(isset($_POST['reset_email']) && filter_var($_POST['reset_email'], FILTER_VALIDATE_EMAIL) && isset($_POST['reset_password']) && isset($_POST['reset_code']) && isset($_POST['resend_code']) && isset($_POST['captcha_code']))
	{
		$email = $_POST['reset_email'];
		$new_password = $_POST['reset_password'];
		$code = $_POST['reset_code'];
		$resend_code = $_POST['resend_code'];
		
		if(mb_strlen($email, "UTF-8") < 257 && mb_strlen($new_password, "UTF-8") < 257 && mb_strlen($code, "UTF-8") < 7 && mb_strlen($resend_code, "UTF-8") < 2)
		{
			require '../../database.php';
			$conn = mysqli_connect($dbservername, $dbusername, $dbpassword, $dbname);
			$sql = "SELECT otp, otp_expiry, otp_failure_attempts FROM user_details WHERE email='$email'";
			$result = mysqli_query($conn, $sql);
			if($result && mysqli_num_rows($result) == 1) // valid user
			{
				require '../../hash.php';
				require '../../time.php';
				$row = mysqli_fetch_assoc($result);
				if($resend_code == 0)	// user clicked on submit button
				{
					if(time_placeholder() < $row["otp_expiry"]) // otp didn't expired
					{
						$code = hash_pbkdf2($hash_alg, $salt_f . $code . $salt_r, NULL, $iterations);
						if($row["otp"] == $code)	// valid otp
						{
							
							$new_password = hash_pbkdf2($hash_alg, $salt_f . $new_password . $salt_r, NULL, $iterations);
							if(mysqli_query($conn, "UPDATE user_details SET password='$new_password', status=1, otp=0, otp_expiry=0, otp_failure_attempts=0, login_failure_attempts=0 WHERE email='$email'"))
							{
								echo '{"status":1}';
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
							$body = file_get_contents('../../email_templates/template1.txt') . $url . file_get_contents('../../email_templates/template2.txt') . "password reset" . file_get_contents('../../email_templates/template3.txt') . $otp . file_get_contents('../../email_templates/template4.txt') . "password reset" . file_get_contents('../../email_templates/template5.txt') . $ip . file_get_contents('../../email_templates/template6.txt') . $reply_to . file_get_contents('../../email_templates/template7.txt') . $url . file_get_contents('../../email_templates/template8.txt') . $url . file_get_contents('../../email_templates/template9.txt');
							mail($email, "Reset Password", $body, $headers);
							echo '{"status":1}';
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