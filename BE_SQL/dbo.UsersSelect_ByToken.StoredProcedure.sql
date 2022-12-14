USE [Carte]
GO
/****** Object:  StoredProcedure [dbo].[UsersSelect_ByToken]    Script Date: 10/25/2022 6:47:04 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- =============================================
-- Author: Ruben Ramirez
-- Create date: 09/05/2022
-- Description: Check User Token for Access
-- Code Reviewer: Juan Asencio

-- MODIFIED BY: author
-- MODIFIED DATE:12/1/2020
-- Code Reviewer:
-- Note:
-- =============================================
CREATE proc [dbo].[UsersSelect_ByToken]
	@Token varchar(200)
as

/* ---- TEST CODE ----

	Declare @Token varchar(200) = '64f7dab9-a0bb-4ab9-902d-c0353be06f1a'

	Execute dbo.UsersSelect_ByToken @Token

*/

Begin

		Declare @UserId int

		Select @UserId = ut.UserId
		From dbo.UserTokens as ut
		Where @Token = ut.Token

		SELECT		  Id
					,[Email]
					,[Roles] = (
								Select r.Id, r.Name
								From dbo.Roles as r INNER JOIN dbo.UserRoles as ur ON r.Id = ur.RoleId
								Where ur.UserId = u.Id
								FOR JSON AUTO
							   )
			FROM [dbo].[Users] as u
			WHERE Id = @UserId
			

End
GO
