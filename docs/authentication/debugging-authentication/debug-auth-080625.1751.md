Received: from 127.0.0.1
 by atlas-production.v2-mail-prod1-gq1.omega.yahoo.com pod-id atlas--production-gq1-fb5f4cbd-6l2jz.gq1.yahoo.com with HTTP; Wed, 6 Aug 2025 21:48:28 +0000
Return-Path: <pm_bounces@pm-bounces.mail.app.supabase.io>
X-Originating-Ip: [104.245.209.200]
Received-SPF: pass (domain of pm-bounces.mail.app.supabase.io designates 104.245.209.200 as permitted sender)
Authentication-Results: atlas-production.v2-mail-prod1-gq1.omega.yahoo.com;
 dkim=pass header.i=@pm.mtasv.net header.s=pm20250324 arc_overridden_status=NOT_OVERRIDDEN;
 dkim=pass header.i=@mail.app.supabase.io header.s=20240920183138pm arc_overridden_status=NOT_OVERRIDDEN;
 spf=pass smtp.mailfrom=pm-bounces.mail.app.supabase.io arc_overridden_status=NOT_OVERRIDDEN;
 dmarc=pass(p=REJECT) header.from=mail.app.supabase.io arc_overridden_status=NOT_OVERRIDDEN;
X-Apparently-To: rogerjharris@yahoo.com; Wed, 6 Aug 2025 21:48:28 +0000
X-YMailISG: VdXi0okWLDsISMf5s3zk_5GO4Es7.0OD9QVbSI0hKWV7CsTm
 7iLI7HKPKgl8IsbWIQDfj5ZQ.beE3RYW2gha9ZTupcaA0vwxhKhVawtPJfQ0
 RyPaafw7X7M6b2QwOdS7Oivv.kfs0LBRWQrYDKjnHwsnjWZwx7Ng71q0.GJS
 mOFkWEo246LIUXTDMxa6_PEh_ZbAuk43togRzmn489OKkvQqs4s1iKROWFgm
 04erKCtnRW6Oga8T3QRzLNqma2CwglrRMUZoleQ.rspfsanEEIxI5_GBEEl9
 wlDISCvYoQ06O0VPkBF0VCO.SZqCagSkmqZK_N75.WalatbG7vpr8yqEB1QJ
 lo.YUJr2JHfR4BZ0I3why4pYjVylVso_OtY3e.wgOF.pzYF3PIGspdsbIJDg
 jDNsCjYHwAj07X1DbldciPrLbRBwG6F4SXX4J5SvxrzJD8Vh5kqBYbfJ4NBh
 oTNPiyNmjQkEllybA9dofwkeZ25fjx1A9zl5Dmj0OzrGYkFwCBDh.YEyKsMZ
 UHlEGlkE5.zgLVqRLgp2gibUjpfdpvfvYhjvNBh7xxp1avEHZ3DVtr6B6imD
 X6RQ7egM9BlUuw4XUkAxzTHZd0nyrCapZwgr9fLr.w3jzXM1AXAzJKVeLKJu
 I1F6OGeW98.ylcoyMkDkdGnexmoU1J6Ya9ssGkzEEe4d9m.8qOarhOfo5z0r
 EePU4Ka5nb_8.rhQKbHOcNBes.cGFEBbB_PrLMfyxMhS93Mg66EMOgTD2n..
 9gvNpLh8HWAIM1nowFuECDmjCIuGf1KgxSbtOq3FabPh_10ijKNeqfDQXKY1
 B2Hlw1_cTG1Kgb_78iSbDnWQ9D81zahpkjKO_OdoFNu64gNKWk9t2ZChCAzZ
 NLtveFOYdLjad6leUnM5M4Z957PZSplExiKYQ0aFW1VNGtB9quZGfqscwSHs
 mG_0NKhUF5VKBGBk2OlmMv1PGJzmxqa9dSC5X_6Z53ZfiBFNTHbWaZBBYpe3
 G6eKTTloO.ooXVNznI6_MUe_APFoZIknCv2a0F4aXxuzL_GYLTO4Dhn7jtz3
 T6WAMiozZ6u3fYi16LW18rQm0SZzIrkimq5kGxmRRaUhJzhuGcXFrC7hCKMn
 v2ZDpt2KhgeNQ29juy35.nBbNCvu3kelgzfCUs4yg.KH_aXfaxfH2Iqb1pPF
 Lw6gSDj1VcCYNx3yuQBZpck-
Received: from 104.245.209.200 (EHLO mta200a-ord.mtasv.net)
 by 10.253.233.86 with SMTPs
 (version=TLS1_3 cipher=TLS_AES_128_GCM_SHA256);
 Wed, 06 Aug 2025 21:48:28 +0000
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; s=pm20250324; d=pm.mtasv.net;
 h=From:Date:Subject:Message-Id:To:MIME-Version:Content-Type:
 Content-Transfer-Encoding:Date:From:Message-ID:Reply-To:Sender:Subject:To:CC;
 t=1754516908; x=1754603308;
 bh=g8/2VzmakJKLETSyUKqXA5JaJdEqzJZ4vKEXNEsUpYo=;
 b=CnLOHXOA0PoTEhQFdcgO80zgauIJBUdtQR3D+cwTtTGtV/mKH+wb+e12yamKqq94HvwFAwPQailW
   E7DTQv+13cjHqZBE9uZfNmkTg8D5EmoUQCEiJFGOxkKkJXY6xF8nEYTbqsHfDrT53qrYIvYgyA7+
   2NeMCcDv+JsiHYmnbnpMbBsxILgMQn3ODBDKGNG2U2ZtPAHOEe7FLRL+t+xaMQlUdSB34uYKqTHh
   E/fywojM414QpNSuufp2v9tS4VL4U2ZDXv0y4CWtKul2OTGU0wAROMA4bst/GGD9AFayr6YjDCuA
   OHkMEdCcpjJS2OLRa9NItoqdHNZ0i8A4rgtymA==
Received: by mta200a-ord.mtasv.net id hif6qm3b84km for <rogerjharris@yahoo.com>; Wed, 6 Aug 2025 17:48:27 -0400 (envelope-from <pm_bounces@pm-bounces.mail.app.supabase.io>)
X-PM-IP: 104.245.209.200
X-IADB-IP: 104.245.209.200
X-IADB-IP-REVERSE: 200.209.245.104
DKIM-Signature: v=1; a=rsa-sha256; d=mail.app.supabase.io; s=20240920183138pm;
	c=relaxed/relaxed; i=noreply@mail.app.supabase.io; t=1754516907;
	x=1754689707;
	h=date:date:from:from:message-id:reply-to:sender:subject:subject:to:to:cc:
	feedback-id:mime-version:content-type:content-transfer-encoding;
	bh=g8/2VzmakJKLETSyUKqXA5JaJdEqzJZ4vKEXNEsUpYo=;
	b=UBF0xim62o0j3Z5bheCWgIqGOXbdR8Lf8V58wVjL+xiWckOD6FzrNb7Ucnmml8F6YJdrTSsGOhE
	9ObeSHLxw/EC2SYKm0+kjKpLlKj3MPHFo1XFyCRRFCflGWWKDPK3sHWwd1HoDwBDKRbkhlhCxSQ8S
	dmGJl8UVtlpnTKK9iEY=
From: Supabase Auth <noreply@mail.app.supabase.io>
Date: Wed, 06 Aug 2025 21:48:27 +0000
Subject: Your Magic Link
Message-Id: <9d61c7ff-4950-4bbb-a44d-c1192e8cc5bd@mtasv.net>
To: rogerjharris@yahoo.com
X-SES-Message-Tags: ses:feedback-id-a=kummmbuildcstnzahzsy,ses:feedback-id-b=magiclink
Feedback-ID: s14387545-_:s14387545:a268058:postmark
X-Complaints-To: abuse@postmarkapp.com
X-PM-Message-Id: 9d61c7ff-4950-4bbb-a44d-c1192e8cc5bd
X-PM-RCPT: |bTB8MjY4MDU4fDE0Mzg3NTQ1fHJvZ2VyamhhcnJpc0B5YWhvby5jb20=|
X-PM-Message-Options: v1;1.k9xTmGFH0bAgEpzxZhka4g.OavLMEbZx5ncRDrjK9TNEWpWxVA_wAblV-GyWpR-aW0w1fR4fJpmLRCGp3znN7cn8Q1-NVVD3qDUDm2tXoxQjA0pgE1YES_kCx0Id8Zg45-AI7CuPJI56bZ0uOjBX8l3wtwylpfiUycK0iSy3_MsD7QTzhWfoTWDiHuGz3pBs4wiCMDtFSseU_PRMA6p-z_5-1M3fit2TgrcYWTJyAvN1bKLEUG53wSp1HQ5Y41mRrY
MIME-Version: 1.0
X-PM-MTA-Pool: transactional-3
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: quoted-printable
Content-Length: 1506

<h2>Magic Link</h2>

<p>Follow this link to login:</p>
<p><a href=3D"https://kummmbuildcstnzahzsy.supabase.co/auth/v1/verify?token=
=3D708d2fa7da291c5a425ac66cfa61aeaded36fd7855d0de551624c873&amp;type=3Dmagi=
clink&amp;redirect_to=3Dhttp://localhost:3000">Log In</a></p>
  <div style=3D"width: 100%; margin: 32px 0; padding: 0; font-family: Arial=
, sans-serif; font-size: 14px; color: #333333; word-break: break-word;">
    <table role=3D"presentation" width=3D"100%" cellpadding=3D"0" cellspaci=
ng=3D"0" style=3D"border-collapse: collapse;">
      <tr>
        <td align=3D"center" style=3D"padding: 20px;">
          <table role=3D"presentation" width=3D"100%" cellpadding=3D"0" cel=
lspacing=3D"0">
           =20
  <tr>
    <td align=3D"center" style=3D"padding-bottom: 16px; font-size: 14px; co=
lor: #666666;">
      You're receiving this email because you signed up for an application

      <a href=3D"https://supabase.com/?utm_source=3Dauth-email&utm_medium=3D=
email&utm_campaign=3Dpowered-by-supabase" style=3D"color: #666666; text-dec=
oration:underline">
  powered by Supabase
      </a>=E2=9A=A1=EF=B8=8F
    </td>
  </tr>
            <tr>
              <td align=3D"center" style=3D"font-size: 12px; color: #666666=
;">
                <a href=3D"https://supabase.com/opt-out/kummmbuildcstnzahzs=
y" style=3D"color: #666666; text-decoration: underline;">Opt out of these e=
mails</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>