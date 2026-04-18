# Autograph UX Benchmark

Date reviewed: April 17, 2026

## Goal
Use strong patterns from autograph, signature-request, and signing products to make Buddhi Align's autograph exchange easier to understand without changing the existing request/sign/archive flow.

## Top references reviewed
1. Adobe Acrobat Sign
   https://helpx.adobe.com/acrobat/using/send-for-signature.html
2. Adobe Acrobat "Get signatures"
   https://experienceleague.adobe.com/en/docs/document-cloud-learn/acrobat-learning/getting-started/signatures
3. DocuSign eSignature features
   https://www.docusign.com/products/electronic-signature/features
4. DocuSign free electronic signature
   https://www.docusign.com/products/electronic-signature/learn/free-electronic-signature
5. Dropbox Sign signature request
   https://faq.hellosign.com/hc/en-us/articles/205830938-How-to-send-a-signature-request
6. Dropbox Sign signer attachments
   https://faq.hellosign.com/hc/en-us/articles/360019150271-Requesting-attachments-from-signers
7. airSlate SignNow request signature
   https://www.signnow.com/features/request-signature
8. PandaDoc send and sign a document
   https://support.pandadoc.com/pt/articles/9714673-enviar-e-assinar-um-documento
9. PandaDoc document and signature forwarding
   https://support.pandadoc.com/en/articles/9714774-document-and-signature-forwarding
10. Signeasy eSignature
    https://signeasy.com/e-signature
11. Signeasy sending a document for signature
    https://support.signeasy.com/en-US/signeasy/article/2q0rctaq-sending-a-document-for-signature
12. SignWell
    https://www.signwell.com/
13. Jotform Sign
    https://form.jotform.com/enterprise/sign/
14. Zoho Sign
    https://www.zoho.com/sign/online-signature.html
15. BoldSign free electronic signature
    https://boldsign.com/free-electronic-signature-software/

## Autograph-specific references reviewed
1. Streamily personalization
   https://help.streamily.com/article/12-how-does-order-personalization-work
2. Streamily sign types
   https://help.streamily.com/article/25-sign-types
3. Streamily order status
   https://help.streamily.com/article/4-how-do-i-check-the-status-of-my-order
4. SWAU autograph signing
   https://swau.com/pages/convention-services
5. SWAU autograph signing product flow
   https://swau.com/products/tom-holland-autograph-signing
6. GalaxyCon private signings
   https://galaxycon.com/
7. Mintych send-in policy
   https://www.mintychauthentics.com/pages/send-in-policy-instructions

## Repeated patterns across the benchmark
- Start with one obvious first step.
- Use action language instead of internal system language.
- Show clear status labels for requested, waiting, signed, completed.
- Let users personalize their request instead of starting from a blank box.
- Keep the signer on one page with a guided reply flow.
- Reduce friction by pre-filling names, roles, and signature styles.
- Explain what happens next right beside the action, not in separate docs.
- Make completed items easy to search later.

## Patterns applied to Buddhi Align
- Added a guided hero with "what to do next" instead of only decorative summary stats.
- Reframed setup and request creation as Step 1 and Step 2.
- Reworded confusing labels like "Choose signer" into plainer language like "Who should sign for you?"
- Added request-message ideas and autograph-message ideas so users are not forced into a blank-state composition experience.
- Added context panels so people can see who they are asking and how the other person will experience the request.
- Clarified inbox language so giving an autograph feels like replying to a real person, not processing a record.
- Clarified archive search language and outbox status framing.

## Guardrails kept
- Existing API endpoints unchanged.
- Existing request, sign, and archive mechanics unchanged.
- Existing signed-state and pending-state behavior preserved.
