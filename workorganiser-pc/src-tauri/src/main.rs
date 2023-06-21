#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use window_vibrancy::{apply_blur, apply_vibrancy, NSVisualEffectMaterial};

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
    if let Some(splashscreen) = window.get_window("splashscreen") {
        splashscreen.close().unwrap();
    }

    window.get_window("loginWindow").unwrap().show();
}

#[tauri::command]
fn applyBlur(app_handle: tauri::AppHandle, label: String) {
    let window = app_handle.get_window(&label).unwrap();

    apply_blur(&window, Some((18, 18, 18, 125)))
        .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
}

fn main() {
    tauri_plugin_deep_link::prepare("com.fomalhaut.pl");
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            tauri_plugin_deep_link::register("workorganiser", move |request| {
                dbg!(&request);
                handle.emit_all("scheme-request-received", request).unwrap();
            });

            let window = app.get_window("loginWindow").unwrap();
            let splashscreen_window = app.get_window("splashscreen").unwrap();

            tauri::async_runtime::spawn(async move {
                #[cfg(target_os = "macos")]
                apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                    .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

                #[cfg(target_os = "windows")]
                apply_blur(&window, Some((18, 18, 18, 125)))
                    .expect("Unsupported platform! 'apply_blur' is only supported on Windows");
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![applyBlur, close_splashscreen])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
