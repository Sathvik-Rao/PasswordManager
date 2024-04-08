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
			$sql = "SELECT capacity_in_bytes, max_rows FROM user_details WHERE email='". $decoded->email ."' and jwt_id='". $decoded->id ."'";
			$result = mysqli_query($conn, $sql);
			if($result && mysqli_num_rows($result) == 1) // valid user
			{
				$row = mysqli_fetch_assoc($result);
				$max_capacity = $row['capacity_in_bytes'];
				$max_rows = $row['max_rows'];
				$data = file_get_contents('php://input');
				if(isset($_COOKIE['id']) && $_COOKIE['id'] != "" && is_numeric($_COOKIE['id']))	
				{
					if(mysqli_query($conn, "USE $dbname_user"))
					{
						$sql = "SELECT COUNT(*) AS count FROM `$decoded->email`";
						$result = mysqli_query($conn, $sql);
						if($result && mysqli_num_rows($result) == 1)	// get how many rows used
						{
							$row = mysqli_fetch_assoc($result);
							$used_rows = $row['count'];
							if(($used_rows-1) <= $max_rows)	// valid to insert new row
							{
								if(isset($_COOKIE['header']) && $_COOKIE['header'] == "1")	// set header
								{
									if(mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`"))
									{
										$stmt = $conn->prepare("INSERT INTO `". $decoded->email ."_temp` (id, header, size_in_bytes) VALUES (". $_COOKIE['id'] .", ?, 0)");
										$stmt->bind_param("s", $data);
										if($stmt->execute())
										{
											$stmt->close();
											mysqli_close($conn);
											ob_clean();
											echo pack("C", 49);
											exit();
										}
									}
								}
								else
								{
									$sql = "SELECT * FROM `". $decoded->email ."_temp` WHERE id=". $_COOKIE['id'];
									$result = mysqli_query($conn, $sql);
									if($result && mysqli_num_rows($result) == 1)	// validate true id
									{
										$row = mysqli_fetch_assoc($result);
										$id = $row['id'];
										$header = $row['header'];
										$temp_data_size = $row['size_in_bytes'];
										$sql = "SELECT SUM(size_in_bytes) AS size_in_bytes FROM `$decoded->email`";
										$result = mysqli_query($conn, $sql);
										if($result && mysqli_num_rows($result) == 1)	// get file(s) size
										{
											$row = mysqli_fetch_assoc($result);
											$main_data_size = $row['size_in_bytes'];
											$received_bytes = strlen($data);	
											if(($received_bytes + $main_data_size + $temp_data_size) <= $max_capacity) // validate capacity
											{
												require '../../files.php';
												array_map('unlink', array_diff(glob($path . $decoded->email . "/*_temp"), array($path . $decoded->email . "/" . $id . "_temp"))); // remove temp files except present id
												if(isset($_COOKIE['append']) && $_COOKIE['append'] != "")	// multiple-in
												{ 
													if($_COOKIE['append'] == "1")	// start and middle
													{
														$file = fopen($path . $decoded->email . "/" . $id . "_temp", "a");
														if($file)
														{
															if(fwrite($file, $data))
															{
																if(fclose($file) && mysqli_query($conn, "UPDATE `". $decoded->email ."_temp` SET size_in_bytes=". ($temp_data_size + $received_bytes) ." WHERE id=". $id))
																{	
																	mysqli_close($conn);
																	ob_clean();
																	echo pack("C", 49);		// success
																	exit();
																}
																else
																{
																	mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
																	unlink($path . $decoded->email . "/" . $id . "_temp");
																}
															}
															else
															{
																mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
																fclose($file);
																unlink($path . $decoded->email . "/" . $id . "_temp");
															}
														}
														else
														{
															mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
														}
													}
													else if($_COOKIE['append'] == "2")	// end
													{
														$file = fopen($path . $decoded->email . "/" . $id . "_temp", "a");
														if($file)
														{
															if(fwrite($file, $data))
															{
																if(fclose($file))
																{
																	@unlink($path . $decoded->email . "/" . $id);
																	if(rename($path . $decoded->email . "/" . $id . "_temp", $path . $decoded->email . "/" . $id))
																	{
																		mysqli_query($conn, "DELETE FROM `$decoded->email` WHERE id=". $id);
																		if(mysqli_query($conn, "INSERT INTO `$decoded->email` (id, header, size_in_bytes) VALUES (". $id .", '". $header ."', ". ($temp_data_size + $received_bytes) .")"))
																		{
																			mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
																			mysqli_close($conn);
																			ob_clean();
																			echo pack("C", 49);		// success
																			exit();
																		}
																		else
																		{
																			mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
																			unlink($path . $decoded->email . "/" . $id);
																		}
																	}
																	else
																	{
																		mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
																		unlink($path . $decoded->email . "/" . $id . "_temp");
																	}
																}
																else
																{
																	mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
																	unlink($path . $decoded->email . "/" . $id . "_temp");
																}
															}
															else
															{
																mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
																fclose($file);
																unlink($path . $decoded->email . "/" . $id . "_temp");
															}
														}
														else
														{
															mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
														}
													}
												}
												else 	// single-in
												{
													$file = fopen($path . $decoded->email . "/" . $id, "w");
													if($file)
													{
														if(fwrite($file, $data))
														{
															mysqli_query($conn, "DELETE FROM `$decoded->email` WHERE id=". $id);
															if(mysqli_query($conn, "INSERT INTO `$decoded->email` (id, header, size_in_bytes) VALUES (". $id .", '". $header ."', ". $received_bytes .")"))
															{
																fclose($file);
																mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
																mysqli_close($conn);
																ob_clean();
																echo pack("C", 49);		// success
																exit();															
															}
															else
															{
																mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
																unlink($path . $decoded->email . "/" . $id);
															}
														}
														else
														{
															mysqli_query($conn, "DELETE FROM `$decoded->email` WHERE id=". $id);
															mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
															fclose($file);
															unlink($path . $decoded->email . "/" . $id);
														}
													}
													else
													{
														mysqli_query($conn, "DELETE FROM `". $decoded->email ."_temp`");
													}
												}
											}
										}
									}
								}
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
?>
