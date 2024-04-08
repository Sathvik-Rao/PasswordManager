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
		if(isset($_POST['signup_email']) && filter_var($_POST['signup_email'], FILTER_VALIDATE_EMAIL) && isset($_POST['signup_password']))
		{
			$email = $_POST['signup_email'];
			$password = $_POST['signup_password'];
			
			if(mb_strlen($email, "UTF-8") < 257 && mb_strlen($password, "UTF-8") < 257)
			{
				require '../../database.php';
				$conn = mysqli_connect($dbservername, $dbusername, $dbpassword, $dbname);
				require '../../otp.php';
				require '../../time.php';
				$otp = otp_0();
				$otp_expiry = time_placeholder() + 3600;
				require '../../hash.php';
				$password = hash_pbkdf2($hash_alg, $salt_f . $password . $salt_r, NULL, $iterations);
				$otp_hashed = hash_pbkdf2($hash_alg, $salt_f . $otp . $salt_r, NULL, $iterations);
				$sql = "INSERT INTO user_details(email, password, status, created_on, otp, otp_expiry, otp_failure_attempts, login_failure_attempts, capacity_in_bytes, max_rows, jwt_id) VALUES('$email', '$password', 0, ". time_placeholder() .", '$otp_hashed', ". $otp_expiry .", 0, 0, 104857600, 300, '')";
				if(mysqli_query($conn, $sql))   // new user
				{
					// send otp
					$ip = $_SERVER['REMOTE_ADDR'];
					require '../../email.php';
					$url = trim(file_get_contents('../../URL.txt'));
					$body = file_get_contents('../../email_templates/template1.txt') . $url . file_get_contents('../../email_templates/template2.txt') . "registering" . file_get_contents('../../email_templates/template3.txt') . $otp . file_get_contents('../../email_templates/template4.txt') . "sign up" . file_get_contents('../../email_templates/template5.txt') . $ip . file_get_contents('../../email_templates/template6.txt') . $reply_to . file_get_contents('../../email_templates/template7.txt') . $url . file_get_contents('../../email_templates/template8.txt') . $url . file_get_contents('../../email_templates/template9.txt');
					mail($email, "Welcome to Password Manager", $body, $headers);
					echo '{"status":1}';
				}
				else	// existing user
				{
					echo '{"status":2}';
				}
				mysqli_close($conn);
			}
		}
	}
?>