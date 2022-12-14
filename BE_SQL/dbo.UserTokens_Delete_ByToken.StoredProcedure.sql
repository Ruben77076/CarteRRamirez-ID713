USE [Carte]
GO
/****** Object:  StoredProcedure [dbo].[UserTokens_Delete_ByToken]    Script Date: 10/25/2022 6:47:04 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author: Ruben Ramirez
-- Create date: 08/26/2022
-- Description: User Tokens Delete By Token
-- Code Reviewer: Ryan Richardson

-- MODIFIED BY: author
-- MODIFIED DATE:12/1/2020
-- Code Reviewer:
-- Note:
-- =============================================

	CREATE proc [dbo].[UserTokens_Delete_ByToken]
		@Token varchar(200)

	as

	/* ---- TEST CODE ----
		Declare @Token varchar(200) = '5e157e26-f5ad-4a2a-b988-d2099ad106a7'

		Select *
		From dbo.UserTokens

		Execute dbo.UserTokens_Delete_ByToken @Token

		Select *
		From dbo.UserTokens

	*/

	Begin 

		DELETE FROM [dbo].[UserTokens]
			  WHERE Token = @Token

	End 
GO
