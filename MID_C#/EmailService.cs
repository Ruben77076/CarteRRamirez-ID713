using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using EllipticCurve;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.VisualBasic;
using Sabio.Models;
using Sabio.Models.AppSettings;
using Sabio.Models.Domain;
using Sabio.Models.Requests.Emails;
using Sabio.Models.Requests.OrgInvites;
using Sabio.Services.Interfaces;
using SendGrid;
using SendGrid.Helpers.Mail;
using Stripe;
using File = System.IO.File;

namespace Sabio.Services.Email
{
    public class EmailService : IEmailService
    {
        private static AppKeys _appKeys;

        private IWebHostEnvironment _hostEnvironment;

        public EmailService(
            IOptions<AppKeys> AppKeys,
            IWebHostEnvironment environment
        )
        {
            _appKeys = AppKeys.Value;
            _hostEnvironment = environment;
        }

        public void SendWelcome(EmailRequest emailRequest)
        {
            SenderEmailRequest senderRequest = new SenderEmailRequest();

            emailRequest.Sender = senderRequest;
            var emailTemplate =
                File
                    .ReadAllText($"{_hostEnvironment.WebRootPath}/EmailTemplates/WelcomeEmail.html")
                    .Replace("{{userName}}", emailRequest.RecipientName)
                    .Replace("{{token}}", emailRequest.Token);
            senderRequest.SenderEmail = _appKeys.DomainEmail;
            senderRequest.SenderName = "Carte";
            emailRequest.SubjectLine = "Welcome to Carte!";
            emailRequest.Message = emailTemplate;

            AssembleEmail(emailRequest);
        }


        public async void Confirm(string email, string token)
        {
            string path =
                $"{_hostEnvironment.WebRootPath}/EmailTemplates/VerifyEmail.html";
            string tokenLink =
                $"{_appKeys.DomainName}confirm?token={token}?email={email}";

            SendGridMessage msg =
                new SendGridMessage()
                {
                    From = new EmailAddress(_appKeys.DomainEmail, "Carte"),
                    Subject = "Please confirm your email",
                    PlainTextContent = "Please confirm your email",
                    HtmlContent =
                        File
                            .ReadAllText(path)
                            .Replace("{{tokenLink}}", tokenLink)
                };
            msg.AddTo(new EmailAddress(email, "Carte Recieved"));
            await SendEmail(msg);
        }

        public async void SendContactUsEmail(ContactUs model)
        {
            string name = model.FirstName + " " + model.LastName;
            EmailAddress from = new EmailAddress(model.Email, name);
            string subject = $"{model.Subject}";

            // time bieng admin email
            var to = new EmailAddress("cartesend@dispostable.com");
            string plainTextContent = $"{model.Message}";

            SendGridMessage msg =
                MailHelper
                    .CreateSingleEmail(from,
                    to,
                    subject,
                    plainTextContent,
                    model.Message);
            await SendEmail(msg);
        }
        public async void Invite(OrgInviteAddRequest inviteModel, string token, OrganizationV1 orgModel)
        {
            string path =
                $"{_hostEnvironment.WebRootPath}/EmailTemplates/OrgInvite.html";
            string tokenLink =
                $"{_appKeys.DomainName}users/invite?token={token}";
            string organization = orgModel.Name;
            string role = "";
            if (inviteModel.InviteTypeId == 1)
            {
                role = "OrgAdmin";
            }
            else if (inviteModel.InviteTypeId == 2)
            {
                role = "MenuEditor";
            }
            else if (inviteModel.InviteTypeId == 3)
            {
                role = "Employee";
            };

            var from = new EmailAddress(_appKeys.DomainEmail, "Carte");
            var to = new EmailAddress(inviteModel.Email);
            var subject = "Please confirm your token";
            string plainTextContent = "Please confirm your token";
            var htmlContent =
                File
                    .ReadAllText(path)
                    .Replace("{{tokenLink}}", tokenLink)
                    .Replace("{{organization}}", organization)
                    .Replace("{{role}}", role);

            SendGridMessage msg =
                MailHelper
                    .CreateSingleEmail(from,
                    to,
                    subject,
                    plainTextContent,
                    htmlContent);
            await SendEmail(msg);
        }

        public async void AssembleEmail(EmailRequest model)
        {
            var from =
                new EmailAddress(model.Sender.SenderEmail,
                    model.Sender.SenderName);
            var to =
                new EmailAddress(model.RecipientEmail, model.RecipientName);
            var subject = model.SubjectLine;
            var plainTextContent = model.Message;
            var htmlContent = model.Message;
            var message =
                MailHelper
                    .CreateSingleEmail(from,
                    to,
                    subject,
                    plainTextContent,
                    htmlContent);

            await SendEmail(message);
        }
        public async void ForgotPassword(string email, string token)
        {
            string path = $"{_hostEnvironment.WebRootPath}/EmailTemplates/ForgotPassword.html";


            string tokenLink = $"{_appKeys.DomainName}changepassword?token={token}";
            

            SendGridMessage msg = new SendGridMessage()
            {
                From = new EmailAddress(_appKeys.DomainEmail, "Carte"),
                Subject = "Forgot Your Password?",
                PlainTextContent = "Please reset your password!",
                HtmlContent = File
                            .ReadAllText(path)
                            .Replace("{{tokenLink}}", tokenLink)
            };
            msg.AddTo(new EmailAddress(email));
            await SendEmail(msg);
        }

        private async Task SendEmail(SendGridMessage msg)
        {
            string apiKey = _appKeys.SendGridAppKey;
            var client = new SendGridClient(apiKey);
            var response = await client.SendEmailAsync(msg);
        }
    }
}
