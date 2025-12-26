// // routes/pdfProxy.js
// import express from "express";
// import fetch from "node-fetch";
// import stream from "stream";

// const router = express.Router();

// /**
//  * PDF Proxy Route
//  * This route fetches PDFs from Cloudinary and serves them with proper headers
//  * to avoid Chrome extension issues
//  */
// router.get("/", async (req, res) => {
//   try {
//     const { url, filename = "preview.pdf" } = req.query;

//     if (!url) {
//       return res.status(400).json({
//         success: false,
//         error: "PDF URL is required",
//       });
//     }

//     console.log(`📄 PDF Proxy: Fetching PDF from ${url.substring(0, 100)}...`);

//     // Decode URL if it's encoded
//     const pdfUrl = decodeURIComponent(url);

//     // Fetch the PDF
//     const response = await fetch(pdfUrl, {
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
//       },
//       timeout: 30000,
//     });

//     if (!response.ok) {
//       console.error(
//         `❌ PDF fetch failed: ${response.status} ${response.statusText}`
//       );
//       return res.status(response.status).json({
//         success: false,
//         error: `Failed to fetch PDF: ${response.statusText}`,
//       });
//     }

//     // Get content type and size
//     const contentType =
//       response.headers.get("content-type") || "application/pdf";
//     const contentLength = response.headers.get("content-length");

//     console.log(`✅ PDF fetched: ${contentLength} bytes, ${contentType}`);

//     // Set headers for PDF display
//     res.setHeader("Content-Type", contentType);
//     res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

//     if (contentLength) {
//       res.setHeader("Content-Length", contentLength);
//     }

//     // Stream the PDF
//     const pdfStream = response.body;
//     pdfStream.pipe(res);

//     pdfStream.on("error", (error) => {
//       console.error("❌ PDF stream error:", error);
//       if (!res.headersSent) {
//         res.status(500).json({
//           success: false,
//           error: "Failed to stream PDF",
//         });
//       }
//     });
//   } catch (error) {
//     console.error("❌ PDF Proxy error:", error);

//     if (!res.headersSent) {
//       res.status(500).json({
//         success: false,
//         error: error.message,
//         message: "Failed to load PDF",
//       });
//     }
//   }
// });

// export default router;



// routes/pdfProxy.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

/**
 * PDF Proxy Route
 * Fetches PDFs from external URLs (like Cloudinary) and serves them with proper headers
 * This bypasses Chrome extension blocking issues
 */
router.get("/", async (req, res) => {
  try {
    const { url, filename = "preview.pdf" } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: "PDF URL is required"
      });
    }
    
    console.log(`📄 PDF Proxy: Fetching PDF from ${url.substring(0, 100)}...`);
    
    // Decode URL
    const pdfUrl = decodeURIComponent(url);
    
    // Fetch the PDF with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(pdfUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/pdf, */*'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`❌ PDF fetch failed: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        success: false,
        error: `Failed to fetch PDF: ${response.statusText}`
      });
    }
    
    // Get content type and size
    const contentType = response.headers.get('content-type') || 'application/pdf';
    const contentLength = response.headers.get('content-length');
    
    console.log(`✅ PDF fetched: ${contentLength} bytes, ${contentType}`);
    
    // Set headers for PDF display
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    
    // Stream the PDF directly
    response.body.pipe(res);
    
  } catch (error) {
    console.error("❌ PDF Proxy error:", error.message);
    
    if (error.name === 'AbortError') {
      return res.status(504).json({
        success: false,
        error: "PDF fetch timed out"
      });
    }
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: "Failed to load PDF"
      });
    }
  }
});

export default router;