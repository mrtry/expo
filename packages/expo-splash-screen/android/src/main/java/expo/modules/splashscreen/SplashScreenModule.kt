package expo.modules.splashscreen

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlinx.coroutines.launch

// Below import must be kept unversioned even in versioned code to provide a redirection from
// versioned code realm to unversioned code realm.
// Without this import any `SplashScreen.anyMethodName(...)` invocation on JS side ends up
// in versioned SplashScreen kotlin object that stores no information about the ExperienceActivity.

class SplashScreenOptions : Record {
  @Field
  val duration: Long = 400L
}

class SplashScreenModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoSplashScreen")

    Function("setOptions") { options: SplashScreenOptions ->
      // Needs to run on the main thread on apis below 33
      appContext.mainQueue.launch {
        SplashScreenManager.setSplashScreenOptions(options)
      }
    }

    Function("hide") {
      SplashScreenManager.hide()
    }

    // For backwards compatibility
    AsyncFunction("hideAsync") {
      SplashScreenManager.hide()
    }
  }
}
