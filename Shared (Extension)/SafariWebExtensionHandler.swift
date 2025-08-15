//
//  SafariWebExtensionHandler.swift
//  Shared (Extension)
//
//

import SafariServices
import os.log

let SFExtensionMessageKey = "message"

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    func beginRequest(with context: NSExtensionContext) {
        let item = context.inputItems[0] as! NSExtensionItem
        let message = item.userInfo?[SFExtensionMessageKey]
        os_log(.default, "Received message from browser.runtime.sendNativeMessage: %@", message as! CVarArg)

        let response = NSExtensionItem()
        
        // Handle different message types
        if let messageDict = message as? [String: Any],
           let action = messageDict["action"] as? String {
            
            switch action {
            case "checkPurchase":
                let paymentStatus = PaymentVerifier.shared.checkPaymentStatus()
                response.userInfo = [SFExtensionMessageKey: paymentStatus]
            default:
                response.userInfo = [SFExtensionMessageKey: ["error": "Unknown action"]]
            }
        } else {
            response.userInfo = [SFExtensionMessageKey: ["error": "Invalid message format"]]
        }

        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
}
