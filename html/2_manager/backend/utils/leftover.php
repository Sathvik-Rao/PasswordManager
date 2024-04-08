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
			$sql = "SELECT capacity_in_bytes FROM user_details WHERE email='". $decoded->email ."' and jwt_id='". $decoded->id ."'";
			$result = mysqli_query($conn, $sql);
			if($result && mysqli_num_rows($result) == 1) // valid user
			{
				$row = mysqli_fetch_assoc($result);
				$max_capacity = $row['capacity_in_bytes'];
				if(mysqli_query($conn, "USE $dbname_user"))
				{
					$sql = "SELECT SUM(size_in_bytes) AS size_in_bytes FROM `$decoded->email`";
					$result = mysqli_query($conn, $sql); 
					if($result && mysqli_num_rows($result) == 1) 
					{
						$row = mysqli_fetch_assoc($result);
						$size_occupied = $row['size_in_bytes'];
						echo '{"status":1,"max_capacity":'. $max_capacity .',"size_occupied":'. $size_occupied .'}';
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
