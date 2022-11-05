using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Sabio.Data;
using Sabio.Data.Providers;
using Sabio.Models;
using Sabio.Models.Domain;
using Sabio.Models.Domain.User;
using Sabio.Models.Requests.SiteReferences;
using Sabio.Models.Requests.User;
using Stripe;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Reflection;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Sabio.Services
{
    public class UserService : IUserService
    {
        private IAuthenticationService<int> _authenticationService;
        private IDataProvider _dataProvider;

        public UserService(IAuthenticationService<int> authSerice, IDataProvider dataProvider)
        {
            _authenticationService = authSerice;
            _dataProvider = dataProvider;
        }

        public async Task<bool> LogInAsync(string email, string password)
        {
            bool isSuccessful = false;

            IUserAuthData response = Get(email, password);

            if (response != null)
            {
                await _authenticationService.LogInAsync(response);
                isSuccessful = true;
            }
            return isSuccessful;
        }

        public async Task<bool> LogInTest(string email, string password, int id, string[] roles = null)
        {
            bool isSuccessful = false;
            var testRoles = new[] { "User", "Super", "Content Manager" };

            var allRoles = roles == null ? testRoles : testRoles.Concat(roles);

            IUserAuthData response = new UserBase
            {
                Id = id
                ,
                Name = email
                ,
                Roles = allRoles
                ,
                TenantId = "Carte"
            };

            Claim fullName = new Claim("CustomClaim", "Sabio Bootcamp");
            await _authenticationService.LogInAsync(response, new Claim[] { fullName });

            return isSuccessful;
        }

        public int Create(UserAddRequest model)
        {
            //make sure the password column can hold long enough string. put it to 100 to be safe

            int userId = 0;

            string salt = BCrypt.BCryptHelper.GenerateSalt();
            string hashedPassword = BCrypt.BCryptHelper.HashPassword(model.Password, salt);

            //DB provider call to create user and get us a user id

            //be sure to store both salt and passwordHash
            //DO NOT STORE the original password value that the user passed us

            string procName = "[dbo].[Users_InsertV2]";

            DataTable tbl = new DataTable();

            tbl = MapRoles(model.IsRestaurantOrg, model.InviteTypeId);

            _dataProvider.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@Email", model.Email);
                    col.AddWithValue("@Password", hashedPassword);
                    col.AddWithValue("@batchRoles", tbl);

                    SqlParameter idOut = new SqlParameter("@Id", SqlDbType.Int);
                    idOut.Direction = ParameterDirection.Output;

                    col.Add(idOut);
                },
                returnParameters: delegate (SqlParameterCollection returnCollection)
                {
                    object oId = returnCollection["@Id"].Value;
                    int.TryParse(oId.ToString(), out userId);
                });

            return userId;
        }

        public void AddReference(SiteReferencesInsert model, int userId)
        {
            string procName = "dbo.SiteReferences_Insert";
            _dataProvider.ExecuteNonQuery(procName, inputParamMapper: delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@UserId", userId);
                col.AddWithValue("@ReferenceType", model.ReferenceType);
                if (model.OtherSource == null)
                {
                    col.AddWithValue("@OtherSource", DBNull.Value);
                }
                else
                {
                    col.AddWithValue("@OtherSource", model.OtherSource);
                }
            }, returnParameters: null);
        }


        public void AddUserOrgs(int userId, int orgId)
        {
            string procName = "[dbo].[UserOrgs_Insert]";

            _dataProvider.ExecuteNonQuery(procName,
              inputParamMapper: delegate (SqlParameterCollection col)
              {
                  col.AddWithValue("@UserId", userId);
                  col.AddWithValue("@OrgId", orgId);
              },
              returnParameters: null);
        }

        private static DataTable MapRoles(bool isRestaurantOrg, int InviteTypeId)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("RoleId", typeof(int));

            if (InviteTypeId == 1)
            {
                DataRow drRole = dt.NewRow();
                drRole.SetField(0, 2);
                dt.Rows.Add(drRole);
            }
            else if (InviteTypeId == 2)
            {
                DataRow drRole = dt.NewRow();
                drRole.SetField(0, 3);
                dt.Rows.Add(drRole);
            }
            else if (InviteTypeId == 3)
            {
                DataRow drRole = dt.NewRow();
                drRole.SetField(0, 4);
                dt.Rows.Add(drRole);
            }
            else
            {
                DataRow dr = dt.NewRow();
                dr.SetField(0, 5);
                dt.Rows.Add(dr);
            }
            if (isRestaurantOrg == true)
            {
                DataRow drr = dt.NewRow();
                drr.SetField(0, 2);
                dt.Rows.Add(drr);
            }

            return dt;
        }

        public void AddToken(string token, int userId, int tokenType)
        {
            string tokenProcName = "[dbo].[UserTokens_Insert]";

            _dataProvider.ExecuteNonQuery(tokenProcName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@Token", token);
                    col.AddWithValue("@UserId", userId);
                    col.AddWithValue("@TokenType", tokenType);
                });
        }

        public void ConfirmUser(string token)
        {
            string procName = "[dbo].[Users_ConfirmToken]";
            _dataProvider.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@Token", token);
                },
                returnParameters: null);
        }

        public string ChangeMyPasswordId(int id)
        {
            string token = null;
            
            string procName = "[dbo].[UserTokens_SelectById]";
            _dataProvider.ExecuteCmd(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@UserId", id);
                },singleRecordMapper:delegate (IDataReader reader, short set)
                {
                    int startIdx = 0;
                    token = reader.GetSafeString(startIdx++);
                });
            
            return token;
            
        }
        
        public int ForgotMyPassword(string email)
        {
                int id = 0;

                string procName = "[dbo].[Users_SelectByEmail]";
                _dataProvider.ExecuteCmd(procName,
                    inputParamMapper: delegate (SqlParameterCollection col)
                    {
                        col.AddWithValue("@Email", email);

                    }, singleRecordMapper: delegate (IDataReader reader, short set)
                    {
                        int startIdx = 0;

                        id = reader.GetSafeInt32(startIdx++);

                    });
                return id;
                  
        }
        public int PasswordToken(string token)
        {
            int id = 0;
            string procName = "[dbo].[UsersSelect_ByToken]";
            _dataProvider.ExecuteCmd(procName, inputParamMapper: delegate (SqlParameterCollection paramColl)
            {
                paramColl.AddWithValue("@Token", token);
            },singleRecordMapper: delegate (IDataReader reader, short set)
            {
                int startIdx = 0;
                id = reader.GetSafeInt32(startIdx++);
            });
           return id;
            
        }
        public void PasswordReset(int userId,string password)
        {
            string salt = BCrypt.BCryptHelper.GenerateSalt();
            string hashedPassword = BCrypt.BCryptHelper.HashPassword(password, salt);

            string procName = "[dbo].[Users_UpdatePassword]";
            _dataProvider.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@Password", hashedPassword);
                    col.AddWithValue("@Id", userId);
                },
                returnParameters: null);
        }
        public bool CheckLoginPassword(string email, string password)
        {
            bool isSuccessfull = false;

            IUserAuthData response = Get(email, password);

            if (response != null)
            { 
                isSuccessfull = true;
            }

            return isSuccessfull;
        }


        /// <summary>
        /// Gets the Data call to get a give user
        /// </summary>
        /// <param name="email"></param>
        /// <param name="passwordHash"></param>
        /// <returns></returns>
        private IUserAuthData Get(string email, string password)
        {
            //make sure the password column can hold long enough string. put it to 100 to be safe
            string passwordFromDb = "";
            UserBase user = null;

            //get user object from db;

            string procName = "[dbo].[Users_Select_AuthDataV2]";

            _dataProvider.ExecuteCmd(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@Email", email);
                },
                singleRecordMapper: delegate (IDataReader reader, short set)
                {
                    int startingIdx = 0;
                    UserBase aUser = new UserBase();

                    aUser.Id = reader.GetSafeInt32(startingIdx++);
                    aUser.Name = reader.GetSafeString(startingIdx++);
                    passwordFromDb = reader.GetSafeString(startingIdx++);

                    //aUser.Roles = new[] { reader.GetSafeString(startingIdx++) };

                    string roles = reader.GetSafeString(startingIdx++);

                    if (!string.IsNullOrEmpty(roles))
                    {
                        var roels = JsonConvert.DeserializeObject<IEnumerable<LookUp>>(roles);
                        aUser.Roles = roels.Select(r => r.Name).ToList();
                    }
                    aUser.TenantId = "Carte";

                    bool isValidCredentials = BCrypt.BCryptHelper.CheckPassword(password, passwordFromDb);

                    if (isValidCredentials)
                    {
                        user = aUser;
                    }
                });

            return user;
        }

        public UserV2 HasProfile(int userId, UserBase user)
        {
            string procName = "[dbo].[Users_Current]";
            UserV2 aUser = null;
            _dataProvider.ExecuteCmd(procName, delegate (SqlParameterCollection col)
            {
                col.AddWithValue("@UserId", userId);
            },
            singleRecordMapper: delegate (IDataReader reader, short set)
            {
                UserV2 userV2 = new UserV2();
                userV2.HasProfile = reader.GetSafeBool(0);
                userV2.Id = user.Id;
                userV2.Name = user.Name;
                userV2.Roles = user.Roles;
                userV2.TenantId = user.TenantId;
                aUser = userV2;
            });
            return aUser;
        }

        public void DeleteToken(string token)
        {
            string procName = "[dbo].[UserTokens_Delete_ByToken]";
            _dataProvider.ExecuteNonQuery(procName,
                inputParamMapper: delegate (SqlParameterCollection col)
                {
                    col.AddWithValue("@Token", token);
                },
                returnParameters: null);
        }
    }

   
}