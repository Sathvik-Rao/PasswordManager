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
			$sql = "SELECT max_rows FROM user_details WHERE email='". $decoded->email ."' and jwt_id='". $decoded->id ."'";
			$result = mysqli_query($conn, $sql);
			if($result && mysqli_num_rows($result) == 1) // valid user
			{
				$row = mysqli_fetch_assoc($result);
				$max_rows = $row['max_rows'];
				if(mysqli_query($conn, "USE $dbname_user"))
				{
					$sql = "SELECT COUNT(*) AS count FROM `$decoded->email`";
					$result = mysqli_query($conn, $sql);
					if($result && mysqli_num_rows($result) == 1)	// get how many rows used
					{
						$row = mysqli_fetch_assoc($result);
						$used_rows = $row['count'] - 1;
						echo '{"status":1,"max_rows":'. $max_rows .',"used_rows":'. $used_rows .'}';
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
