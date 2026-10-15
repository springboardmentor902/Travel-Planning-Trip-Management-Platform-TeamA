package com.tripnest.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // ✅ Async — email send karna app ko slow nahi karega
    @Async
    public void sendEmail(String to,
                          String subject,
                          String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML

            mailSender.send(message);
            log.info("Email sent to: {}", to);

        } catch (Exception e) {
            log.error("Email send failed to {}: {}",
                    to, e.getMessage());
        }
    }

    // ============================================================
    // EMAIL TEMPLATES
    // ============================================================

    // Group Invitation Email
    public void sendGroupInvitationEmail(String to,
                                          String userName,
                                          String groupName,
                                          String invitedBy) {
        String subject = "TripNest — You're invited to "
                + groupName;

        String body = buildEmailTemplate(
            "Group Invitation 👥",
            "Hi " + userName + "!",
            "<b>" + invitedBy + "</b> has invited you to join "
            + "the travel group <b>\"" + groupName + "\"</b>.",
            "Accept Invitation",
            frontendUrl + "/groups"
        );

        sendEmail(to, subject, body);
    }

    // Trip Reminder Email
    public void sendTripReminderEmail(String to,
                                       String userName,
                                       String tripTitle,
                                       String destination,
                                       String startDate,
                                       long daysLeft) {
        String subject = "TripNest — Your trip to "
                + destination + " starts in "
                + daysLeft + " day(s)!";

        String body = buildEmailTemplate(
            "Trip Reminder ✈️",
            "Hi " + userName + "!",
            "Your trip <b>\"" + tripTitle + "\"</b> to "
            + "<b>" + destination + "</b> is starting on "
            + "<b>" + startDate + "</b> — just "
            + "<b>" + daysLeft + " day(s)</b> away!",
            "View Trip",
            frontendUrl + "/trips"
        );

        sendEmail(to, subject, body);
    }

    // Budget Alert Email
    public void sendBudgetAlertEmail(String to,
                                      String userName,
                                      String tripTitle,
                                      double percentage) {
        String subject = "TripNest — Budget Alert for "
                + tripTitle;

        String emoji = percentage >= 100 ? "🚨" : "⚠️";
        String msg = percentage >= 100
            ? "Your budget for <b>\"" + tripTitle
              + "\"</b> has been <b>exceeded!</b>"
            : "You have used <b>" + percentage
              + "%</b> of your budget for <b>\""
              + tripTitle + "\"</b>.";

        String body = buildEmailTemplate(
            "Budget Alert " + emoji,
            "Hi " + userName + "!",
            msg,
            "View Budget",
            frontendUrl + "/trips"
        );

        sendEmail(to, subject, body);
    }

    // Invitation Accepted Email
    public void sendInvitationAcceptedEmail(String to,
                                             String ownerName,
                                             String memberName,
                                             String groupName) {
        String subject = "TripNest — "
                + memberName + " joined " + groupName;

        String body = buildEmailTemplate(
            "New Member Joined! 🎉",
            "Hi " + ownerName + "!",
            "<b>" + memberName + "</b> has accepted your "
            + "invitation and joined <b>\""
            + groupName + "\"</b>.",
            "View Group",
            frontendUrl + "/groups"
        );

        sendEmail(to, subject, body);
    }

    // Activity Reminder Email
    public void sendActivityReminderEmail(String to,
                                           String userName,
                                           String activityTitle,
                                           String tripTitle,
                                           String activityDate) {
        String subject = "TripNest — Activity reminder: "
                + activityTitle;

        String body = buildEmailTemplate(
            "Activity Reminder 🗓️",
            "Hi " + userName + "!",
            "You have an upcoming activity <b>\""
            + activityTitle + "\"</b> for your trip <b>\""
            + tripTitle + "\"</b> on <b>"
            + activityDate + "</b>.",
            "View Itinerary",
            frontendUrl + "/trips"
        );

        sendEmail(to, subject, body);
    }

    // Shared Expense Email
    public void sendSharedExpenseEmail(String to,
                                        String userName,
                                        String expenseDesc,
                                        double shareAmount,
                                        String paidBy,
                                        String tripTitle) {
        String subject = "TripNest — New shared expense in "
                + tripTitle;

        String body = buildEmailTemplate(
            "Shared Expense Added 💰",
            "Hi " + userName + "!",
            "<b>" + paidBy + "</b> added a shared expense "
            + "<b>\"" + expenseDesc + "\"</b> in trip <b>\""
            + tripTitle + "\"</b>. "
            + "Your share is <b>₹" + shareAmount + "</b>.",
            "View Expenses",
            frontendUrl + "/trips"
        );

        sendEmail(to, subject, body);
    }

    // ============================================================
    // HTML TEMPLATE
    // ============================================================

    private String buildEmailTemplate(String heading,
                                       String greeting,
                                       String content,
                                       String btnText,
                                       String btnUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport"
                      content="width=device-width,
                               initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;
                         background:#f8fafc;
                         font-family:Arial,sans-serif;">

              <table width="100%%" cellpadding="0"
                     cellspacing="0"
                     style="background:#f8fafc;padding:40px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0"
                           cellspacing="0"
                           style="background:#ffffff;
                                  border-radius:16px;
                                  overflow:hidden;
                                  box-shadow:0 4px 24px
                                  rgba(0,0,0,0.06);">

                      <!-- HEADER -->
                      <tr>
                        <td style="background:#2563eb;
                                   padding:32px 40px;
                                   text-align:center;">
                          <h1 style="margin:0;color:#ffffff;
                                     font-size:24px;
                                     font-weight:700;">
                            ✈️ TripNest
                          </h1>
                          <p style="margin:8px 0 0;
                                    color:#bfdbfe;
                                    font-size:13px;">
                            Travel smarter, together.
                          </p>
                        </td>
                      </tr>

                      <!-- BODY -->
                      <tr>
                        <td style="padding:40px;">
                          <h2 style="margin:0 0 16px;
                                     color:#1e293b;
                                     font-size:20px;">
                            %s
                          </h2>
                          <p style="margin:0 0 12px;
                                    color:#475569;
                                    font-size:15px;">
                            %s
                          </p>
                          <p style="margin:0 0 32px;
                                    color:#475569;
                                    font-size:15px;
                                    line-height:1.6;">
                            %s
                          </p>

                          <!-- BUTTON -->
                          <table cellpadding="0"
                                 cellspacing="0">
                            <tr>
                              <td style="background:#2563eb;
                                         border-radius:10px;">
                                <a href="%s"
                                   style="display:inline-block;
                                          padding:14px 28px;
                                          color:#ffffff;
                                          font-weight:600;
                                          font-size:14px;
                                          text-decoration:none;">
                                  %s →
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- FOOTER -->
                      <tr>
                        <td style="padding:24px 40px;
                                   background:#f8fafc;
                                   border-top:1px solid #e2e8f0;
                                   text-align:center;">
                          <p style="margin:0;
                                    color:#94a3b8;
                                    font-size:12px;">
                            © 2024 TripNest.
                            Travel planning made simple.
                          </p>
                          <p style="margin:6px 0 0;
                                    color:#94a3b8;
                                    font-size:11px;">
                            You received this email because
                            you are registered on TripNest.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(
                heading, greeting, content, btnUrl, btnText);
    }
}