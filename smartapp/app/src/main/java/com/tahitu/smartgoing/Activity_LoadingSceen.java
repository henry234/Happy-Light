package com.tahitu.smartgoing;
import android.app.Activity;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.ViewSwitcher;

import com.google.android.gms.maps.model.LatLng;
import com.tahitu.smartgoing.Algorithm.Distance;
import com.tahitu.smartgoing.Algorithm.Duration;
import com.tahitu.smartgoing.Algorithm.Route;
import com.tahitu.smartgoing.Algorithm.Signal;
import com.tahitu.smartgoing.Algorithm.SolutionMap;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;

public class Activity_LoadingSceen extends Activity {
    public static Signal signalTraffic = new Signal();

    @Override
    protected void onRestart() {
        super.onRestart();
        this.finish();
    }

    //creates a ViewSwitcher object, to switch between Views
    private ViewSwitcher viewSwitcher;

    /**
     * Called when the activity is first created.
     */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        //Initialize a LoadViewTask object and call the execute() method
        new LoadViewTask().execute();
    }

    //To use the AsyncTask, it must be subclassed
    private class LoadViewTask extends AsyncTask<Void, Integer, Void> {
        //A TextView object and a ProgressBar object
        private TextView tv_progress;
        private ProgressBar pb_progressBar;

        @Override
        protected Void doInBackground(Void... voids) {
            try {
                //Get the current thread's token
                synchronized (this) {
                    //Initialize an integer (that will act as a counter) to zero
                    int counter = 0;
                    //While the counter is smaller than four
                    while (counter <= 3) {
                        this.wait(500);
                        //Increment the counter
                        counter++;
                        //Set the current progress.
                        //This value is going to be passed to the onProgressUpdate() method.
                        publishProgress(counter * 25);
                    }
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return null;
        }

        //Before running code in the separate thread
        @Override
        protected void onPreExecute() {
            //Initialize the ViewSwitcher object
            viewSwitcher = new ViewSwitcher(Activity_LoadingSceen.this);
            /* Initialize the loading screen with data from the 'loadingscreen.xml' layout xml file.
             * Add the initialized View to the viewSwitcher.*/
            viewSwitcher.addView(ViewSwitcher.inflate(Activity_LoadingSceen.this, R.layout.activity__loading_sceen, null));

            //Initialize the TextView and ProgressBar instances - IMPORTANT: call findViewById() from viewSwitcher.
            tv_progress = (TextView) viewSwitcher.findViewById(R.id.tv_progress);
            pb_progressBar = (ProgressBar) viewSwitcher.findViewById(R.id.pb_progressbar);
            //Sets the maximum value of the progress bar to 100
            pb_progressBar.setMax(100);

            //Set ViewSwitcher instance as the current View.
            setContentView(viewSwitcher);
        }

        //The code to be executed in a background thread.


        //Update the TextView and the progress at progress bar
        @Override
        protected void onProgressUpdate(Integer... values) {
            if (values[0] <= 100) {
//                tv_progress.setText("Loading, Please wait ... ");
                pb_progressBar.setProgress(values[0]);
            }
        }

        @Override
        protected void onPostExecute(Void aVoid) {
            String link = "http://172.16.2.135:3000/directions/";
            try {
                URL url = new URL(link);
                InputStream is = null;
                try {
                    is = url.openConnection().getInputStream();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                StringBuffer buffer = new StringBuffer();
                BufferedReader reader = new BufferedReader(new InputStreamReader(is));

                String line;
                while ((line = reader.readLine()) != null) {
                    buffer.append(line + "\n");
                }
                try {
                    parseJSon(buffer.toString());
                } catch (JSONException e) {
                    e.printStackTrace();
                }

            } catch (MalformedURLException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
            ;

            Intent intent = new Intent(Activity_LoadingSceen.this, MainActivity.class);
            startActivity(intent);
        }

        private void parseJSon(String data) throws JSONException {
            if (data == null) {
                return;
            }

            try {
                JSONObject jsonData = new JSONObject(data);
                JSONObject jsonSignal = jsonData.getJSONObject("signal");
                signalTraffic.signal = new LatLng(jsonSignal.getDouble("lat"), jsonSignal.getDouble("lng"));
            } catch (Exception e) {
                return;
            }
            return;
        }
    }

    //Override the default back key behavior
    @Override
    public void onBackPressed() {
        //Emulate the progressDialog.setCancelable(false) behavior
        //If the first view is being shown
        if (viewSwitcher.getDisplayedChild() == 0) {
            //Do nothing
            return;
        } else {
            //Finishes the current Activity
            super.onBackPressed();
        }
    }
}