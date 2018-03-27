package com.tahitu.smartgoing;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.support.design.widget.NavigationView;
import android.support.v4.app.FragmentManager;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.getbase.floatingactionbutton.FloatingActionButton;
import com.getbase.floatingactionbutton.FloatingActionsMenu;
import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.common.GooglePlayServicesRepairableException;
import com.google.android.gms.location.places.Place;
import com.google.android.gms.location.places.ui.PlaceAutocomplete;
import com.google.android.gms.location.places.ui.PlacePicker;
import com.google.android.gms.maps.CameraUpdate;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;
import com.google.android.gms.maps.model.MarkerOptions;
import com.tahitu.smartgoing.Algorithm.SolutionMap;
import com.twotoasters.jazzylistview.JazzyListView;
import com.twotoasters.jazzylistview.effects.TiltEffect;

import java.util.ArrayList;

import static com.tahitu.smartgoing.SearchDialogFragment.voice;
import static com.tahitu.smartgoing.mapfragment.myMap;

public class MainActivity extends AppCompatActivity
        implements NavigationView.OnNavigationItemSelectedListener{

    public static int index = -1;
    public static TextView tvChiTietCachDi;
    private LinearLayout updownBottomSheet;
    public static LinearLayout bottom_sheet;
    public static ImageButton btnUpDown;
    public static FloatingActionsMenu fabAdd;
    public static SearchDialogFragment searchDialogFragment;
    private FloatingActionButton fabSearchPlace;
    private boolean kt_Bottom = true;

    public static JazzyListView listViewResult;
    public static ArrayList<PlaceResult> listPlaceResult = new ArrayList<PlaceResult>();
    public static ListPlaceResultAdapter adapterResult;
    public static TextView tvBestDistance;
    public static FragmentManager fragmentManager;
    private FloatingActionButton fabHistorySearch;
    public static boolean isLoadHistory = false;
    private FloatingActionButton fabLookup;
    private boolean pressLookup;
    public static ProgressDialog myProgress;
    public static AlertDialog.Builder builderFail;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        mapfragment map_fragment = new mapfragment();
        FragmentManager fragmentManager = getSupportFragmentManager();
        fragmentManager.beginTransaction().replace(R.id.content_main, map_fragment, map_fragment.getTag()).commit();

        //region Navbar
        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawer.setDrawerListener(toggle);
        toggle.syncState();
        NavigationView navigationView = (NavigationView) findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);
        //endregion

        addControls();
        addEvents();
    }

    private void addEvents() {
        fabSearchPlace.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                searchDialogFragment = new SearchDialogFragment();
                FragmentManager fragmentManager = getSupportFragmentManager();
                searchDialogFragment.show(fragmentManager, null);
            }
        });

        tvChiTietCachDi.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if(kt_Bottom)
                {
                    listViewResult.setVisibility(View.GONE);
                    kt_Bottom = false;
                }
                else
                {
                    listViewResult.setVisibility(View.VISIBLE);
                    kt_Bottom = true;
                }
            }
        });

        updownBottomSheet.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if(kt_Bottom)
                {
                    listViewResult.setVisibility(View.GONE);
                    kt_Bottom = false;
                }
                else
                {
                    listViewResult.setVisibility(View.VISIBLE);
                    kt_Bottom = true;
                }
            }
        });

        //----------------------------- click result item

        listViewResult.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
                TextView tvResultDes = (TextView) view.findViewById(R.id.txtResultDestination);
                tvResultDes.setTextColor(Color.RED);

                CameraUpdate moveCamera = CameraUpdateFactory.newLatLngZoom(
                        SolutionMap.matrixRoutes[SolutionMap.bestPath[i+1]][SolutionMap.bestPath[i+1]].startLocation, 15);
                myMap.animateCamera(moveCamera);

//                myMap.moveCamera(CameraUpdateFactory.newLatLngZoom(matrixRoutes[bestPath[i]][bestPath[i+1]].startLocation, 16));

                for (int j = 0; j < listViewResult.getChildCount(); j++) {
                    if (j != i) {
                        TextView tv = (TextView) listViewResult.getChildAt(j).findViewById(R.id.txtResultDestination);
                        tv.setTextColor(Color.rgb(0, 153, 255));
                    }
                }

                if (i > 0) {
                    for (int j = 1; j < listViewResult.getChildCount(); j++) {
                        if (j != i) {
                            SolutionMap.polylinePaths.get(j-1).setColor(Color.BLUE);
                        }
                    }

                    SolutionMap.polylinePaths.get(i-1).setColor(Color.RED);
                }
                else {
                    for (int j = 1; j < listViewResult.getChildCount(); j++) {
                            SolutionMap.polylinePaths.get(j-1).setColor(Color.BLUE);
                    }
                }
            }
        });

        fabHistorySearch.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                isLoadHistory = true;
                searchDialogFragment = new SearchDialogFragment();
                 fragmentManager = getSupportFragmentManager();
                searchDialogFragment.show(fragmentManager, null);
            }
        });

        fabLookup.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                pressLookup = true;
                int PLACE_AUTOCOMPLETE_REQUEST_CODE = 1;
                try {
                    Intent intent =
                            new PlaceAutocomplete.IntentBuilder(PlaceAutocomplete.MODE_FULLSCREEN)
                                    .setBoundsBias(new LatLngBounds(
                                            new LatLng(8.407168163601074, 104.1448974609375),
                                            new LatLng(10.7723923007117563, 106.6981029510498)))
                                    .build(MainActivity.this);
                    startActivityForResult(intent, PLACE_AUTOCOMPLETE_REQUEST_CODE);
                } catch (GooglePlayServicesRepairableException | GooglePlayServicesNotAvailableException e) {
                    // TODO: Handle the error.
                }
            }
        });
    }

    private void addControls() {
        fabSearchPlace = (FloatingActionButton) findViewById(R.id.fabSearchPlace);
        tvChiTietCachDi = (TextView) findViewById(R.id.tvChiTietCachDi);
        fabAdd = (FloatingActionsMenu)findViewById(R.id.fabAdd);
        bottom_sheet = (LinearLayout) findViewById(R.id.bottom_sheet);
        updownBottomSheet = (LinearLayout) findViewById(R.id.updownBottomSheet);

        listViewResult = (JazzyListView) findViewById(R.id.listViewResult);
        listViewResult.setTransitionEffect(new TiltEffect());
        adapterResult = new ListPlaceResultAdapter(this, R.layout.place_result_item, listPlaceResult);
        listViewResult.setAdapter(adapterResult);

        tvBestDistance = (TextView) findViewById(R.id.tvBestDistance);

        fabHistorySearch = (FloatingActionButton) findViewById(R.id.fabHistorySearch);
        fabLookup = (FloatingActionButton) findViewById(R.id.fabLookup);

        builderFail = new AlertDialog.Builder(this);
        builderFail.setMessage("Không thể tìm được đường đi")
                .setTitle("  Thông báo  ")
                .setCancelable(false)
                .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        bottom_sheet.setVisibility(View.GONE);
                        fabAdd.setVisibility(View.VISIBLE);
                        SearchDialogFragment.listPlaceSearch.clear();
                        SearchDialogFragment.listLagLngSearch.clear();
                        index = -1;
                    }
                })
                .setNegativeButton("No", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        dialog.cancel();
                    }
                });
        AlertDialog alert = builderFail.create();
    }

    @Override
    public void onBackPressed() {
        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else {
            if (tvChiTietCachDi.getVisibility() == View.VISIBLE) {
                AlertDialog.Builder builder = new AlertDialog.Builder(this);
                builder.setMessage("Bạn có muốn về màn hình chính để tìm kiếm kết quả khác không ?")
                        .setTitle("  Thông báo  ")
                        .setCancelable(false)
                        .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                bottom_sheet.setVisibility(View.GONE);
                                fabAdd.setVisibility(View.VISIBLE);
                                SearchDialogFragment.listPlaceSearch.clear();
                                SearchDialogFragment.listLagLngSearch.clear();
                                index = -1;
                            }
                        })
                        .setNegativeButton("No", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                dialog.cancel();
                            }
                        });
                AlertDialog alert = builder.create();
                alert.show();

            } else {
                AlertDialog.Builder builder = new AlertDialog.Builder(this);
                builder.setMessage("Bạn có thực sự muốn thoát ?")
                        .setTitle("  Thoát chương trình ")
                        .setCancelable(false)
                        .setPositiveButton("Yes", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                MainActivity.this.finish();
                            }
                        })
                        .setNegativeButton("No", new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                dialog.cancel();
                            }
                        });
                AlertDialog alert = builder.create();
                alert.show();

            }
        }
    }

    //region Navbar
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @SuppressWarnings("StatementWithEmptyBody")
    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        // Handle navigation view item clicks here.
        int id = item.getItemId();

        if (id == R.id.home) {
            mapfragment map_fragment = new mapfragment();
            FragmentManager fragmentManager = getSupportFragmentManager();
            fragmentManager.beginTransaction().replace(R.id.content_main, map_fragment, map_fragment.getTag()).commit();

        } else if (id == R.id.nav_FeedBack) {
            Intent sendMessage = new Intent(Intent.ACTION_SEND);
            sendMessage.setType("message/rfc822");
            sendMessage.putExtra(Intent.EXTRA_EMAIL, new String[]{
                    getResources().getString(R.string.feedback_email)});
            try {
                startActivity(Intent.createChooser(sendMessage, "Gửi phản hồi cho TaHiTu"));
            } catch (android.content.ActivityNotFoundException e) {
                Toast.makeText(MainActivity.this, "Communication app not found",
                        Toast.LENGTH_SHORT).show();
            }

        } else if (id == R.id.nav_tacgia) {
            Intent intent = new Intent(MainActivity.this, Activity_Author.class);
            startActivity(intent);
            return true;


        } else if (id == R.id.nav_help) {
            Intent intent = new Intent(MainActivity.this, Activity_Help.class);
            startActivity(intent);
            return true;
        }

        DrawerLayout drawer = (DrawerLayout) findViewById(R.id.drawer_layout);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }
    //endregion

    //region Search DialogFragment
    public void clickChangeSearchItem(View view) {
        int index = SearchDialogFragment.listViewSearch.getPositionForView(view);

        if (index > 0)
        {
            SearchDialogFragment.listPlaceSearch.add(index - 1, SearchDialogFragment.listPlaceSearch.get(index));
            SearchDialogFragment.listPlaceSearch.remove(index + 1);
            SearchDialogFragment.listLagLngSearch.add(index - 1, SearchDialogFragment.listPlaceSearch.get(index));
            SearchDialogFragment.listLagLngSearch.remove(index + 1);
            SearchDialogFragment.adapter.notifyDataSetChanged();
            SearchDialogFragment.listViewSearch.setAdapter(SearchDialogFragment.adapter);
        }
    }

    public void clickSubSearchItem(View view) {
        if (SearchDialogFragment.listViewSearch.getChildCount() > 1) {
            int index = SearchDialogFragment.listViewSearch.getPositionForView(view);
            SearchDialogFragment.listPlaceSearch.remove(index);
            SearchDialogFragment.listLagLngSearch.remove(index);
            SearchDialogFragment.adapter.notifyDataSetChanged();
            SearchDialogFragment.listViewSearch.setAdapter(SearchDialogFragment.adapter);
        }
        else {
            Toast.makeText(getApplicationContext(), "Không thể xóa", Toast.LENGTH_LONG).show();
        }
    }

    public void clickDestination(View view) {
        index = SearchDialogFragment.listViewSearch.getPositionForView(view);

        // gọi cái  Place autoComplete lên
        int PLACE_AUTOCOMPLETE_REQUEST_CODE = 1;
        try {
            Intent intent =
                    new PlaceAutocomplete.IntentBuilder(PlaceAutocomplete.MODE_FULLSCREEN)
                            .setBoundsBias(new LatLngBounds(
                                    new LatLng(8.407168163601074, 104.1448974609375),
                                    new LatLng(10.7723923007117563, 106.6981029510498)))
                            .build(this);
            startActivityForResult(intent, PLACE_AUTOCOMPLETE_REQUEST_CODE);


        } catch (GooglePlayServicesRepairableException | GooglePlayServicesNotAvailableException e) {
            // TODO: Handle the error.
        }
    }
    //endregion

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 1
                && resultCode == Activity.RESULT_OK && !pressLookup) {
            final Place place = PlacePicker.getPlace(data, this);

            if (place != null) {
                CharSequence placeNameSearch = place.getName();
                String[] parts = place.getLatLng().toString().split("\\(");
                String[] parts1 = parts[1].split("\\)");
                String latLngSearch = parts1[0];

                SearchDialogFragment.listPlaceSearch.set(MainActivity.index, placeNameSearch.toString());
                SearchDialogFragment.listLagLngSearch.set(MainActivity.index, latLngSearch);
                SearchDialogFragment.adapter.notifyDataSetChanged();
                SearchDialogFragment.listViewSearch.setAdapter(SearchDialogFragment.adapter);
            }
        }

        if(requestCode == 1
                && resultCode == Activity.RESULT_OK && pressLookup)
        {
            final Place place = PlacePicker.getPlace(data, this);
            if(place != null)
            {
                LatLng latSearch = place.getLatLng();
                myMap.addMarker(new MarkerOptions().position(latSearch).title(place.getAddress().toString()));
                myMap.setMapType(GoogleMap.MAP_TYPE_NORMAL);
                CameraUpdate dichuyen = CameraUpdateFactory.newLatLngZoom(latSearch, 18);
                myMap.animateCamera(dichuyen);
            }
            pressLookup = false;
        }

        if (resultCode == RESULT_OK && null != data && voice == true) {
            voice = false;
            ArrayList<String> result = data
                    .getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            try {
                String[] temp1 = result.get(0).split("tới ");
                ArrayList<String> arrPlaceFromVoice = new ArrayList<>();
                for (int i = 0; i < temp1.length; i++) {
                    arrPlaceFromVoice.add(i, temp1[i]);
                }
                arrPlaceFromVoice.set(0, (temp1[0].split("đi từ "))[1]);

                for (int i = 0; i < arrPlaceFromVoice.size(); i++) {
                    System.out.println("\nđịa điểm thứ " + i + " là : " + arrPlaceFromVoice.get(i));
                }
                if (arrPlaceFromVoice.size() < 2) {
                    arrPlaceFromVoice.clear();
                    String[] temp2 = result.get(0).split("đến ");
                    for (int i = 0; i < temp2.length; i++) {
                        arrPlaceFromVoice.add(i, temp2[i]);
                    }
                    arrPlaceFromVoice.set(0, (temp2[0].split("đi từ "))[1]);
                }

                if (arrPlaceFromVoice.size() >= 2) {
                    SearchDialogFragment.listLagLngSearch.clear();

                    SearchDialogFragment.txtStartPlace.setText(arrPlaceFromVoice.get(0));
                    SearchDialogFragment.latLngStartPlace = arrPlaceFromVoice.get(0);

                    SearchDialogFragment.listPlaceSearch.clear();
                    for (int i = 1; i < arrPlaceFromVoice.size(); i++) {
                        SearchDialogFragment.listPlaceSearch.add(arrPlaceFromVoice.get(i));
                        SearchDialogFragment.listLagLngSearch.add(arrPlaceFromVoice.get(i));
                    }
                    SearchDialogFragment.adapter.notifyDataSetChanged();
                    SearchDialogFragment.listViewSearch.setAdapter(SearchDialogFragment.adapter);
                }


            }
            catch (Exception e) {
//                Toast.makeText(MainActivity.this, "Không thể nhận dạng câu lệnh. Cú pháp: Đi từ ... đến ...", Toast.LENGTH_LONG).show();
            }
        }
    }
}
