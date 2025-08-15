//
//  AppDelegate.swift
//  macOS (App)
//  Created by ULRIK LYNGS on 30/11/2021.
//

import Cocoa
import Foundation

@main
class AppDelegate: NSObject, NSApplicationDelegate {

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Override point for customization after application launch.
        setupPaymentVerification()
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
    
    private func setupPaymentVerification() {
        // Initialize the shared payment verifier
        // This ensures it's ready when the Safari extension needs it
        _ = PaymentVerifier.shared
        
        // TODO: Set up any macOS-specific payment verification
        // For example:
        // - Initialize Mac App Store receipt validation
        // - Set up in-app purchase handling
        // - Configure subscription management
    }
}
