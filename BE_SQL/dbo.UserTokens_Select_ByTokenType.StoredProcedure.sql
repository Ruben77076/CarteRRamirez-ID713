USE [Carte]
GO
/****** Object:  StoredProcedure [dbo].[UserTokens_Select_ByTokenType]    Script Date: 10/25/2022 6:47:04 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author: Ruben Ramirez
-- Create date: 08/26/2022
-- Description: User Tokens Select By Token Type
-- Code Reviewer: Ryan Richardson

-- MODIFIED BY: author
-- MODIFIED DATE:12/1/2020
-- Code Reviewer:
-- Note:
-- =============================================

	CREATE proc [dbo].[UserTokens_Select_ByTokenType]
		@TokenType int
	as

	/* ---- TEST CODE ----
		Declare @TokenType int = 1

		Execute dbo.UserTokens_Select_ByTokenType @TokenType

	*/

	Begin

		SELECT [Token]
			  ,[UserId]
			  ,[TokenType]
		FROM [dbo].[UserTokens]
	    Where TokenType = @TokenType

	End 
GO
