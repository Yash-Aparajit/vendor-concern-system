const VENDOR_SHEET = "Master_Vendor";
const PART_SHEET   = "Master_Part";
const NAME_SHEET   = "Master_Name";
const LOG_SHEET    = "Inward_Log";

const IMAGE_FOLDER_ID = "Your IMG FOLDER CODE HERE"; //Create a Google drive folder, and copy the link. 


function doGet()
{
  return HtmlService
    .createHtmlOutputFromFile("index")
    .setTitle("Inward Concern Report");
}


/* FETCH CHECKERS */
function getCheckers()
{
  const sh = SpreadsheetApp.getActive().getSheetByName(NAME_SHEET);

  if(!sh) return [];

  const last = sh.getLastRow();

  if(last < 2) return [];

  return sh.getRange(2,1,last-1,1)
    .getValues().flat().filter(String);
}


/* FETCH PART DESCRIPTION */
function getPartDescription(partId)
{
  if(!partId) return "";

  const sh = SpreadsheetApp.getActive().getSheetByName(PART_SHEET);

  const data = sh.getDataRange().getValues();

  const search = String(partId).trim().toLowerCase();

  for(let i=1;i<data.length;i++)
  {
    if(String(data[i][0]).trim().toLowerCase() === search)
      return data[i][1];
  }

  return "";
}


/* FETCH VENDOR BY VIN */
function getVendorByVin(vin)
{
  if(!vin) return null;

  const sh = SpreadsheetApp.getActive().getSheetByName(VENDOR_SHEET);

  if(!sh) return null;

  const last = sh.getLastRow();

  if(last < 2) return null;

  // Force everything to STRING using getDisplayValues()
  const data = sh.getRange(2,1,last-1,4).getDisplayValues();

  const vinMap = {};

  for(let i=0;i<data.length;i++)
  {
    const key = data[i][0].trim();

    vinMap[key] = {
      vin  : key,
      name : data[i][1],
      to   : data[i][2],
      cc   : data[i][3]
    };
  }

  const search = String(vin).trim();

  Logger.log("Searching VIN: " + search);

  Logger.log("Available VIN keys: " + Object.keys(vinMap).slice(0,10));

  return vinMap[search] || null;
}


/* DATE FORMAT */
function formatDateTime(date)
{
  return Utilities.formatDate(
    date,
    Session.getScriptTimeZone(),
    "dd/MM/yyyy HH:mm"
  );
}


/* IMAGE SAVE */
function saveImage(base64)
{
  if(!base64) return "";

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try
  {
    let folder;

    try
    {
      folder = DriveApp.getFolderById(IMAGE_FOLDER_ID);
    }
    catch(e)
    {
      throw new Error("Image folder inaccessible");
    }

    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64),
      "image/jpeg",
      "IMG_"+Date.now()+".jpg"
    );

    const file = folder.createFile(blob);

    file.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW
    );

    return file.getId();
  }
  catch(err)
  {
    throw new Error("Image upload failed: " + err.message);
  }
  finally
  {
    lock.releaseLock();
  }
}


function sendEmail(vendor, form, imageLink)
{
  if(!vendor || !vendor.to)
  {
    Logger.log("Vendor email missing");
    return;
  }

  const subject =
    "Inward Concern Report | Vendor Code: " +
    vendor.vin +
    " | Part: " +
    form.partId +
    " | " +
    formatDateTime(new Date());

  const htmlBody =
`
  <div style="font-family:Arial, sans-serif; font-size:14px; color:#222;">

    <p>Your Greetings</p>

    <p>Conern email content, and description.</p>

    <br>

    <table style="
      border-collapse:collapse;
      width:100%;
      border:1px solid #999;
      font-size:14px;
    ">

      <tr style="background:#f2f2f2; font-weight:bold;">
        <td style="border:1px solid #999; padding:8px;">Vendor Name</td>
        <td style="border:1px solid #999; padding:8px;">Vendor Code</td>
        <td style="border:1px solid #999; padding:8px;">Part ID</td>
        <td style="border:1px solid #999; padding:8px;">Description</td>
        <td style="border:1px solid #999; padding:8px;">Checker</td>
        <td style="border:1px solid #999; padding:8px;">Shift</td>
        <td style="border:1px solid #999; padding:8px;">Driver</td>
        <td style="border:1px solid #999; padding:8px;">Dock</td>
      </tr>

      <tr>
        <td style="border:1px solid #999; padding:8px;">${vendor.name}</td>
        <td style="border:1px solid #999; padding:8px;">${vendor.vin}</td>
        <td style="border:1px solid #999; padding:8px;">${form.partId}</td>
        <td style="border:1px solid #999; padding:8px;">${form.description}</td>
        <td style="border:1px solid #999; padding:8px;">${form.checker}</td>
        <td style="border:1px solid #999; padding:8px;">${form.shift}</td>
        <td style="border:1px solid #999; padding:8px;">${form.driver}</td>
        <td style="border:1px solid #999; padding:8px;">${form.dock}</td>
      </tr>

      <tr style="background:#f9f9f9;">
        <td style="border:1px solid #999; padding:8px; font-weight:bold;">
          Concern Details
        </td>

        <td colspan="7" style="border:1px solid #999; padding:8px;">
          ${form.concern || "-"}
        </td>
      </tr>

      <tr style="background:#f9f9f9;">
        <td style="border:1px solid #999; padding:8px; font-weight:bold;">
          Remark
        </td>

        <td colspan="7" style="border:1px solid #999; padding:8px;">
          ${form.remark || "-"}
        </td>
      </tr>

    </table>

    <br>

    ${
      imageLink
      ?
      `<p>
        <b>Image Link:</b><br>
        <a href="${imageLink}">View Image</a>
      </p>`
      :
      ``
    }

    <br>

    <p>
      Ending of the email, and outro for email.
    </p>

    <p style="color:#555; font-weight:bold;">
      This is an automated system-generated email.
    </p>

    <p>
      Thanks & Regards,<br>
      Your Company Name
    </p>

  </div>
  `;

  GmailApp.sendEmail(
    vendor.to,
    subject,
    "Your email client does not support HTML.",
    {
      htmlBody: htmlBody,
      cc: vendor.cc
    }
  );

  Logger.log("Email sent to: " + vendor.to);
}


/* SAVE ENTRY */
function saveEntry(form)
{
  Logger.log("FULL FORM OBJECT RECEIVED:");
  Logger.log(JSON.stringify(form));

  if(form === null || form === undefined)
    throw new Error("Form object not received");

  const lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try
  {
    const vin = String(form.vin || "").trim();

    if(!vin)
      throw new Error("VIN missing");

    const vendor = getVendorByVin(vin);

    Logger.log("Vendor lookup result:");
    Logger.log(JSON.stringify(vendor));

    if(!vendor)
      throw new Error("Vendor not found for VIN: " + vin);

    const sh = SpreadsheetApp
      .getActive()
      .getSheetByName(LOG_SHEET);

    if(!sh)
      throw new Error("Log sheet missing");

    const now = formatDateTime(new Date());

    let link="";
    let preview="";

    if(form.image)
    {
      const id = saveImage(form.image);

      link =
        "https://drive.google.com/file/d/"+id+"/view";

      preview =
        '=IMAGE("https://drive.google.com/uc?id='+id+'",4,120,120)';
    }

    sh.appendRow([
      now,
      vendor.vin,
      vendor.name,
      form.dock,
      form.partId,
      form.description,
      form.checker,
      form.shift,
      form.concern,
      form.driver,
      link,
      preview,
      form.remark
    ]);

    sh.setRowHeight(sh.getLastRow(),130);

    sendEmail(vendor, form, link);

    return true;
  }
  finally
  {
    lock.releaseLock();
  }
}
