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
			$sql = "SELECT capacity_in_bytes FROM user_details WHERE email='". $decoded->email ."' and jwt_id='". $decoded->id ."'";
			$result = mysqli_query($conn, $sql);
			if($result && mysqli_num_rows($result) == 1) // valid user
			{
				$row = mysqli_fetch_assoc($result);
				$max_capacity = $row['capacity_in_bytes'];
				$cipher_data = file_get_contents('php://input');	// received data
				$received_bytes= strlen($cipher_data);
				if($received_bytes < $max_capacity) // validate capacity
				{
					if(mysqli_query($conn, "USE $dbname_user"))
					{
						if(mysqli_query($conn, "CREATE TABLE `$decoded->email` (id bigint UNIQUE NOT NULL, header text, size_in_bytes bigint)")) // new table
						{
							if(mysqli_query($conn, "CREATE TABLE `". $decoded->email ."_temp` (id bigint UNIQUE NOT NULL, header text, size_in_bytes bigint)")) // new temp table
							{
								if(isset($_COOKIE['header']) && $_COOKIE['header'] != "")
								{
									require '../../files.php';
									if(mkdir($path . $decoded->email))
									{							
										$file = fopen($path . $decoded->email . "/0", "w");
										if($file)
										{
											if(fwrite($file, $cipher_data))
											{
												$stmt = $conn->prepare("INSERT INTO `$decoded->email` (id, header, size_in_bytes) VALUES (0, ?, $received_bytes)");
												$stmt->bind_param("s", $_COOKIE['header']);
												if(fclose($file) && $stmt->execute())
												{
													$stmt->close();
													mysqli_close($conn);
													ob_clean();
													echo pack("C", 49);		// success
													exit();
												}
												else
												{
													todo_clean_sql($conn, $decoded->email);
													todo_clean_files($path, $decoded->email);
												}
											}
											else
											{
												todo_clean_sql($conn, $decoded->email);
												fclose($file);
												todo_clean_files($path, $decoded->email);
											}
										}
										else
										{
											todo_clean_sql($conn, $decoded->email);
											todo_clean_files($path, $decoded->email);
										}
									}
									else
									{
										todo_clean_sql($conn, $decoded->email);
										todo_clean_files($path, $decoded->email);
									}
								}
								else
								{
									todo_clean_sql($conn, $decoded->email);
								}
							}
							else
							{
								mysqli_query($conn, "DROP TABLE `$decoded->email`");
							}
						}
					}
				}
				mysqli_close($conn);		
			}
			else
			{
				mysqli_close($conn);
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

function todo_clean_sql($conn, $email) 
{
    mysqli_query($conn, "DROP TABLE `$email`");
	mysqli_query($conn, "DROP TABLE `". $email ."_temp`");
}

function todo_clean_files($path, $email) 
{
    array_map('unlink', glob($path . $email . "/*"));
	rmdir($path . $email);
}
?>
