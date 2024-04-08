<?php
	$from = "Password Manager <" . getenv('EMAIL_FROM') . ">";
	$reply_to = getenv('REPLY_TO');
	
	$headers = "From: $from\r\n";
	$headers .= "Reply-To: $reply_to\r\n";
	$headers .= "MIME-Version: 1.0\r\n";
	$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
?>