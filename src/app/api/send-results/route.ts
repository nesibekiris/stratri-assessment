import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, name, assessmentType, results, pdfBase64 } = body;

    if (!to || !results) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const typeLabel =
      assessmentType === "maturity" ? "AI Maturity" : "AI Governance";

    const levelNames: Record<number, string> = {
      1: "Exploring",
      2: "Aligning",
      3: "Formalizing",
      4: "Optimizing",
      5: "Governing at Scale",
    };

    const level = Math.round(results.overallScore);
    const levelName = levelNames[level] || "—";

    // Build domain scores HTML
    const domainRows = Object.entries(results.domainScores as Record<string, number>)
      .map(
        ([domain, score]) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #E8E2D9;font-size:14px;color:#1E2A45;">${domain}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #E8E2D9;font-size:14px;color:#184A5A;font-weight:500;text-align:right;">${(score as number).toFixed(1)} / 5.0</td>
        </tr>`
      )
      .join("");

    // Build regional scores HTML if governance
    let regionalHTML = "";
    if (results.regionalScores && Object.keys(results.regionalScores).length > 0) {
      const regionLabels: Record<string, string> = {
        eu: "🇪🇺 EU AI Act",
        us: "🇺🇸 US State AI Laws",
        tr: "🇹🇷 Türkiye KVKK",
      };

      const regionRows = Object.entries(results.regionalScores)
        .map(([id, rs]: [string, any]) => {
          const color = rs.pct < 40 ? "#B54A3F" : rs.pct < 70 ? "#C47F2B" : "#3A7D68";
          return `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #E8E2D9;font-size:14px;">${regionLabels[id] || id}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #E8E2D9;font-size:14px;font-weight:600;color:${color};text-align:right;">${rs.pct}%</td>
          </tr>`;
        })
        .join("");

      regionalHTML = `
        <div style="margin-top:28px;">
          <h3 style="font-family:Georgia,serif;font-size:18px;color:#1E2A45;margin:0 0 12px;">Regional Compliance</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${regionRows}
          </table>
        </div>
      `;
    }

    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#FEFBF8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 24px;">
        
        <!-- Header -->
        <div style="text-align:center;margin-bottom:36px;">
          <div style="font-size:11px;font-weight:500;letter-spacing:3px;color:#184A5A;text-transform:uppercase;margin-bottom:8px;">STRATRI</div>
          <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#1E2A45;margin:0;">
            ${typeLabel} Assessment <em style="font-weight:300;">Results</em>
          </h1>
        </div>

        <div style="width:48px;height:1.5px;background:#9FB7C8;margin:0 auto 32px;"></div>

        <!-- Greeting -->
        <p style="font-size:15px;color:#5A6478;line-height:1.7;">
          ${name ? `Dear ${name},` : "Hello,"}
        </p>
        <p style="font-size:15px;color:#5A6478;line-height:1.7;margin-top:8px;">
          Thank you for completing the STRATRI ${typeLabel} Assessment. Below is a summary of your results.
        </p>

        <!-- Overall Score Card -->
        <div style="background:#fff;border:1px solid #E8E2D9;border-radius:12px;padding:28px;text-align:center;margin:28px 0;">
          <div style="font-size:11px;font-weight:500;letter-spacing:2px;color:#8A8F9C;text-transform:uppercase;margin-bottom:12px;">Overall Maturity Score</div>
          <div style="font-family:Georgia,serif;font-size:48px;font-weight:400;color:#1E2A45;">${results.overallScore.toFixed(1)}</div>
          <div style="font-size:13px;color:#184A5A;font-weight:500;margin-top:4px;">Level ${level} · ${levelName}</div>
        </div>

        <!-- Domain Scores -->
        <h3 style="font-family:Georgia,serif;font-size:18px;color:#1E2A45;margin:0 0 12px;">Domain Breakdown</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          ${domainRows}
        </table>

        ${regionalHTML}

        <!-- CTA -->
        <div style="background:#1E2A45;border-radius:12px;padding:32px;text-align:center;margin:36px 0;">
          <p style="font-size:14px;color:#9FB7C8;margin:0 0 16px;">Ready to close the gaps?</p>
          <a href="https://stratri.com/contact" style="display:inline-block;padding:14px 36px;background:#fff;color:#1E2A45;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Schedule a Consultation</a>
        </div>

        <!-- Footer -->
        <div style="text-align:center;padding-top:24px;border-top:1px solid #E8E2D9;">
          <p style="font-size:11px;color:#8A8F9C;margin:0;">© 2026 STRATRI · Governance & Technology Policy Studio</p>
          <p style="font-size:11px;color:#8A8F9C;margin:4px 0 0;">Istanbul · hello@stratri.com</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Prepare attachments
    const attachments = [];
    if (pdfBase64) {
      attachments.push({
        filename: `STRATRI-${typeLabel.replace(/\s/g, "-")}-Results.pdf`,
        content: pdfBase64,
      });
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "STRATRI Assessments <assessments@stratri.com>",
      to: [to],
      subject: `Your STRATRI ${typeLabel} Assessment Results`,
      html: emailHTML,
      ...(attachments.length > 0 ? { attachments } : {}),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
