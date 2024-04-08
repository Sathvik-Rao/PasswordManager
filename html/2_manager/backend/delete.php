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
				if(mysqli_query($conn, "USE $dbname_user"))
				{
					$id = file_get_contents('php://input');
					if(is_numeric($id) && mysqli_query($conn, "DELETE FROM `$decoded->email` WHERE id=". $id)) 
					{
						require '../../files.php';
						if(unlink($path . $decoded->email . "/" . $id))
						{
							echo '{"status":1}';
						}
					}
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
