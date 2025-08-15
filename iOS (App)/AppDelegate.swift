//
//  AppDelegate.swift
//  iOS (App)
//
//  Created by ULRIK LYNGS on 30/11/2021.
//

import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        setupPaymentVerification()
        return true
    }

    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }
    
    private func setupPaymentVerification() {
        // Initialize the shared payment verifier
        // This ensures it's ready when the Safari extension needs it
        _ = PaymentVerifier.shared
        
        // TODO: Set up any iOS-specific payment verification
        // For example:
        // - Initialize StoreKit
        // - Set up receipt validation
        // - Configure in-app purchase handling
    }
}
