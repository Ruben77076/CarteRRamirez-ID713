USE [Carte]
GO
/****** Object:  StoredProcedure [dbo].[Users_SelectByEmail]    Script Date: 10/25/2022 6:47:04 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author:		Ruben Ramirez
-- Create date: 10/4/2022
-- Description:	Users Select By Email
-- Code Reviewer: 


-- MODIFIED BY: author
-- MODIFIED DATE:12/1/2020
-- Code Reviewer: 
-- Note: 
-- =============================================

	CREATE proc [dbo].[Users_SelectByEmail]
				@Email nvarchar(255)

	/*
	carteuser2@gmail.com

	Declare @Email nvarchar(255) = 'aliketomoveit@gmail.com'

	Execute dbo.Users_SelectByEmail @Email

	Select * 
	from dbo.Users
	
	
	*/

	as
	BEGIN
		
		Declare @isConfirmed bit
		Select @isConfirmed = u.isConfirmed
		From dbo.Users as u
		Where @Email = Email

	IF @isConfirmed = 1
		SELECT [Id]
			  ,[Email]
		FROM [dbo].[Users] as u
		WHERE Email = @Email

	ELSE
		THROW 50001, 'User Email Not Confirmed Or Non-Existent', 16
	
	
	

	END
GO
