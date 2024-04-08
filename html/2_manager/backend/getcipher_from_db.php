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
			mysqli_close($conn);
			if($result && mysqli_num_rows($result) == 1) // valid user
			{
				$received_dict = json_decode(file_get_contents('php://input'));
				require '../../files.php';
				if(is_numeric($received_dict->id) && is_numeric($received_dict->start) && is_numeric($received_dict->length))
				{
					$file = fopen($path . $decoded->email . "/" . $received_dict->id, "r");
					if($file)
					{
						fseek($file, $received_dict->start);	// move file pointer
						ob_clean();
						echo fread($file, $received_dict->length);
						fclose($file);
						exit();
					}
				}
			}
			else
			{
				ob_clean();
				echo pack("C", 48);
				exit();
			}
		}
		catch(SignatureInvalidException | UnexpectedValueException | DomainException $e)	// invalid signature
		{
			ob_clean();
			echo pack("C", 48);
			exit();
		}
	}
	else	//jwt cookie not set
	{
		ob_clean();
		echo pack("C", 48);
		exit();
	}
?>
