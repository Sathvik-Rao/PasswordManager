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
			$sql = "SELECT email FROM user_details WHERE email='". $decoded->email ."' and jwt_id='". $decoded->id ."'";
			$result = mysqli_query($conn, $sql);
			if($result && mysqli_num_rows($result) == 1) // valid user
			{
				if(mysqli_query($conn, "USE $dbname_user"))
				{
					$sql = "SELECT id FROM `$decoded->email` WHERE id!=0";
					$result = mysqli_query($conn, $sql);
					if($result) 
					{
						if(mysqli_num_rows($result) > 0)	// alteast single row is present
						{
							$temp = array();
							while($row = $result->fetch_assoc()) 	// fetch each row
							{
								array_push($temp, (int)$row['id']);	  // push into temp array
							}	
							echo '{"status":1, "ids":'. json_encode($temp) .'}';
						}
						else	// no rows
						{
							echo '{"status":1, "ids":[]}';
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
