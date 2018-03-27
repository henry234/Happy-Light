package com.tahitu.smartgoing;

import android.content.Context;
import android.support.annotation.NonNull;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.TextView;

import java.util.List;

/**
 * Created by Dell on 12/26/2016.
 */

public class ListPlaceResultAdapter extends ArrayAdapter<PlaceResult> {

    public ListPlaceResultAdapter(Context context, int resource) {
        super(context, resource);
    }

    public ListPlaceResultAdapter(Context context, int resource, List<PlaceResult> place) {
        super(context, resource, place);
    }

    @NonNull
    @Override
    public View getView(int position, View convertView, ViewGroup parent) {

        View v = convertView;

        if (v == null) {
            LayoutInflater vi;
            vi = LayoutInflater.from(getContext());
            v = vi.inflate(R.layout.place_result_item, null);
        }

        PlaceResult place = getItem(position);

        if (place != null) {
            TextView tvResultDestination = (TextView) v.findViewById(R.id.txtResultDestination);
            tvResultDestination.setText(place.getNamePlace());
            TextView tvSTT = (TextView)v.findViewById(R.id.txtSTT);
            tvSTT.setText(((Integer)position).toString());
        }

        return v;
    }
}
