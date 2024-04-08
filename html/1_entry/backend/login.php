<?php session_start(); ?>
<?php
	require '../securimage/securimage.php';
	$securimage = new Securimage();
	if($securimage->check($_POST['captcha_code']) == false)   // invalid cacptcha
	{
		echo '{"status":0}';
	}
	else
	{
		if(isset($_POST['login_email']) && filter_var($_POST['login_email'], FILTER_VALIDATE_EMAIL) && isset($_POST['login_password']))
		{
			$email = $_POST['login_email'];
			$password = $_POST['login_password'];
			
			if(mb_strlen($email, "UTF-8") < 257 && mb_strlen($password, "UTF-8") < 257)
			{
				require '../../database.php';
				$conn = mysqli_connect($dbservername, $dbusername, $dbpassword, $dbname);
				require '../../hash.php';
				$password = hash_pbkdf2($hash_alg, $salt_f . $password . $salt_r, NULL, $iterations);
				$sql = "SELECT status FROM user_details WHERE email='$email' and password='$password'";
				$result = mysqli_query($conn, $sql);
				if($result && mysqli_num_rows($result) == 1) // valid user
				{
					$row = mysqli_fetch_assoc($result);
					if($row["status"] == 0)	// need otp to validate sign up
					{
						echo '{"status":2}';
					}
					else if($row["status"] == 1) // Success 
					{
						require '../../JWT/JWT.php';
						require '../../jwt_key.php';
						$rand_id = bin2hex(random_bytes(16));
						$payload = array(
							"id" => $rand_id,
							"email" => $email
						);
						$jwt = JWT::encode($payload, $key, $alg);
						if(mysqli_query($conn, "UPDATE user_details SET login_failure_attempts=0, jwt_id='$rand_id' WHERE email='$email'"))
						{
							echo '{"status":1, "jwt":"'. $jwt .'"}';
						}
					}
					else if($row["status"] == 2) // need otp to validate login
					{
						echo '{"status":3}';
					}
				}
				else	// invalid user/credentials
				{
					$sql = "SELECT status, login_failure_attempts FROM user_details WHERE email='$email'";
					$result = mysqli_query($conn, $sql);
					if($result && mysqli_num_rows($result) == 1) // valid email
					{
						$row = mysqli_fetch_assoc($result);
						if($row["status"] != 2)	// valid attempts
						{
							$attempts = $row["login_failure_attempts"];
							if($attempts < 19)
							{
								$attempts++;
								if(mysqli_query($conn, "UPDATE user_details SET login_failure_attempts=$attempts WHERE email='$email'"))
								{
									echo '{"status":4}';
								}
							}
							else
							{
								if(mysqli_query($conn, "UPDATE user_details SET status=2 WHERE email='$email'"))
								{
									$ip = $_SERVER['REMOTE_ADDR'];
									require '../../otp.php';
									require '../../time.php';
									$otp = otp_0();
									$otp_expiry = time_placeholder() + 3600;
									$otp_hashed = hash_pbkdf2($hash_alg, $salt_f . $otp . $salt_r, NULL, $iterations);
									if(mysqli_query($conn, "UPDATE user_details SET otp='$otp_hashed', otp_expiry =$otp_expiry, otp_failure_attempts=0 WHERE email='$email'"))
									{
										require '../../email.php';
										$url = trim(file_get_contents('../../URL.txt'));
										$body = file_get_contents('../../email_templates/template1.txt') . $url . file_get_contents('../../email_templates/template2.txt') . "login" . file_get_contents('../../email_templates/template3.txt') . $otp . file_get_contents('../../email_templates/template4.txt') . "multiple login" . file_get_contents('../../email_templates/template5.txt') . $ip . file_get_contents('../../email_templates/template6.txt') . $reply_to . file_get_contents('../../email_templates/template7.txt') . $url . file_get_contents('../../email_templates/template8.txt') . $url . file_get_contents('../../email_templates/template9.txt');
										mail($email, "Reactivate Account", $body, $headers);
										echo '{"status":4}';
									}
								}
							}
						}
						else	// need otp to validate login
						{
							echo '{"status":3}';
						}
					}
					else	// invalid email
					{
						echo '{"status":5}';
					}
				}
				mysqli_close($conn);
			}
		}
	}
?>