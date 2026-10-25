#[tauri::command]
fn engine_version() -> String { "MotionForge Rust Core 0.5".into() }

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![engine_version])
      .run(tauri::generate_context!())
      .expect("Error running MotionForge");
}
