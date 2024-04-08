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
		if(isset($_POST['reset_email']) && filter_var($_POST['reset_email'], FILTER_VALIDATE_EMAIL))
		{
			$email = $_POST['reset_email'];
			if(mb_strlen($email, "UTF-8") < 257)
			{
				require '../../database.php';
				$conn = mysqli_connect($dbservername, $dbusername, $dbpassword, $dbname);
				$sql = "SELECT email FROM user_details WHERE email='$email'";
				$result = mysqli_query($conn, $sql);
				if($result && mysqli_num_rows($result) == 1) // valid account
				{
					require '../../otp.php';
					require '../../time.php';
					$otp = otp_0();
					$otp_expiry = time_placeholder() + 3600;
					require '../../hash.php';
					$otp_hashed = hash_pbkdf2($hash_alg, $salt_f . $otp . $salt_r, NULL, $iterations);
					if(mysqli_query($conn, "UPDATE user_details SET otp='$otp_hashed', otp_expiry=$otp_expiry, otp_failure_attempts=0 WHERE email='$email'"))
					{
						$ip = $_SERVER['REMOTE_ADDR'];
						require '../../email.php';
						$url = trim(file_get_contents('../../URL.txt'));
						$body = file_get_contents('../../email_templates/template1.txt') . $url . file_get_contents('../../email_templates/template2.txt') . "password reset" . file_get_contents('../../email_templates/template3.txt') . $otp . file_get_contents('../../email_templates/template4.txt') . "password reset" . file_get_contents('../../email_templates/template5.txt') . $ip . file_get_contents('../../email_templates/template6.txt') . $reply_to . file_get_contents('../../email_templates/template7.txt') . $url . file_get_contents('../../email_templates/template8.txt') . $url . file_get_contents('../../email_templates/template9.txt');
						mail($email, "Reset Password", $body, $headers);
						echo '{"status":1}';	
					}
				}
				else	// invalid account
				{
					echo '{"status":2}';
				}
				mysqli_close($conn);
			}
		}
	}
?>