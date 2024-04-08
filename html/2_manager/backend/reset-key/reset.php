<?php
	if(isset($_COOKIE['jwt']) && $_COOKIE['jwt'] != "")
	{
		$jwt = $_COOKIE['jwt'];
		require '../../../JWT/JWT.php';
		require '../../../jwt_key.php';
		try
		{
			$decoded = JWT::decode($jwt, $key, array($alg));
			require '../../../database.php';
			$conn = mysqli_connect($dbservername, $dbusername, $dbpassword, $dbname);
			$sql = "SELECT password FROM user_details WHERE email='". $decoded->email ."' and jwt_id='". $decoded->id ."'";
			$result = mysqli_query($conn, $sql);
			if($result && mysqli_num_rows($result) == 1) // valid user
			{
				$row = mysqli_fetch_assoc($result);
				$data = json_decode(file_get_contents('php://input'));
				require '../../../hash.php';
				$hashed_password = hash_pbkdf2($hash_alg, $salt_f . $data->password . $salt_r, NULL, $iterations);
				if($row['password'] == $hashed_password)	// valid password
				{
					if(mysqli_query($conn, "USE $dbname_user"))
					{
						mysqli_query($conn, "DROP TABLE `". $decoded->email ."_temp`");
						require '../../../files.php';
						array_map('unlink', glob($path . $decoded->email . "/*"));
						rmdir($path . $decoded->email);
						mysqli_query($conn, "DROP TABLE `$decoded->email`");
						echo '{"status":1}';	
					}
				}
				else	// invalid password
				{
					echo '{"status":2}';
				}
			}
			else
			{
				echo '{"status":0}';
			}
			mysqli_close($conn);
		}
		catch(SignatureInvalidException | UnexpectedValueException | DomainException $e)	// invalid signature
		{
			echo '{"status":0}';
		}
	}
	else	//jwt cookie not set
	{
		echo '{"status":0}';
	}
?>
