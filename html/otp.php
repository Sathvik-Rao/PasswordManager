<?php
	function otp_0()
	{
		$keys = ["3","e","C","H","E","m","R","X","q","x","y","9","J","h","r","S","Y","5","j","Q","n","D","K","W","L","M","8","B","p","c","t","i","6","A","F","N","z","P","w","g","7","s","T","d","Z","2","b","1","f","v","u","G","U","k","a","V","4"];
		$otp = "";
		for ($i = 0; $i < 6; $i++) 
		{
			$otp .= $keys[array_rand($keys)];
		}
		return $otp;
	}
?>