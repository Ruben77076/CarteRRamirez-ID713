USE [Carte]
GO
/****** Object:  StoredProcedure [dbo].[UserTokens_Insert]    Script Date: 10/25/2022 6:47:04 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author: Ruben Ramirez
-- Create date: 08/26/2022
-- Description: User Tokens Insert
-- Code Reviewer: Ryan Richardson

-- MODIFIED BY: author
-- MODIFIED DATE:12/1/2020
-- Code Reviewer:
-- Note:
-- =============================================

	CREATE proc [dbo].[UserTokens_Insert]
				 @Token varchar(200)
				,@UserId int
				,@TokenType int 

	as

	/* ---- TEST CODE ----
		Declare  @Token varchar(200) = 'New String'
				,@UserId int = 5
				,@TokenType int = 1

		Execute dbo.UserTokens_Insert
				 @Token
				,@UserId
				,@TokenType

		Select * 
		FROM dbo.UserTokens

		Select *
		FROM dbo.Users
		

	*/

	Begin

		INSERT INTO [dbo].[UserTokens]
				   (
					[Token]
				   ,[UserId]
				   ,[TokenType]
				   )
			 VALUES
				   (
					@Token
				   ,@UserId
				   ,@TokenType 
				   )
	End
GO
