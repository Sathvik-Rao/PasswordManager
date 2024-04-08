<?php
	if(isset($_COOKIE['jwt']) && $_COOKIE['jwt'] != "")
	{
		$jwt = $_COOKIE['jwt'];
		require '../../JWT/JWT.php';
		require '../../jwt_key.php';
		try
		{
			$decoded = JWT::decode($jwt, $key, array($alg));
			require '../../database.php';
			$conn = mysqli_connect($dbservername, $dbusername, $dbpassword, $dbname);
			$sql = "SELECT email FROM user_details WHERE email='". $decoded->email ."' and jwt_id='". $decoded->id ."'";
			$result = mysqli_query($conn, $sql);
			if($result && mysqli_num_rows($result) == 1) // valid user
			{
				$data = file_get_contents('php://input');
				if($data == "1") // send header
				{
					if(mysqli_query($conn, "USE $dbname_user"))
					{
						$sql = "SELECT header FROM `$decoded->email` WHERE id=0";
						$result = mysqli_query($conn, $sql);
						if($result && mysqli_num_rows($result) == 1) 
						{
							$row = mysqli_fetch_assoc($result);
							$json_data = $row['header'];
							echo '{"status":1,"data":'. $json_data .'}';
						}
					}
				}
				else if($data == "0")	// send cipher
				{
					require '../../files.php';
					$file = fopen($path . $decoded->email . "/0", "r");
					if($file)
					{
						$cipher = fread($file, filesize($path . $decoded->email . "/0"));
						fclose($file);
						if($cipher)
						{
							mysqli_close($conn);
							ob_clean(); // cleans the output buffer
							echo $cipher;
							exit();
						}
					}
				}
				mysqli_close($conn);
			}
			else
			{
				mysqli_close($conn);
				ob_clean();
				echo '{"status":0}';
				exit();
			}
		}
		catch(SignatureInvalidException | UnexpectedValueException | DomainException $e)	// invalid signature
		{
			ob_clean();
			echo '{"status":0}';
			exit();
		}
	}
	else	//jwt cookie not set
	{
		ob_clean();
		echo '{"status":0}';
		exit();
	}
?>
