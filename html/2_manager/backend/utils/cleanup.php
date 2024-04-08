{}<?php
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
					mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
					require '../../../files.php';
					array_map('unlink', glob($path . $decoded->email . "/*_temp"));
					mysqli_query($conn, "DROP TABLE `". $decoded->email ."_ck`");
					array_map('unlink', glob($path . $decoded->email . "_ck/*"));
					@rmdir($path . $decoded->email . "_ck");
				}
			}
			mysqli_close($conn);
		}
		catch(Exception $e){}
	}
?>
