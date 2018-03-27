package com.tahitu.smartgoing;

/**
 * Created by Dell on 12/30/2016.
 */

public class PlaceResult {
    String namePlace;
    String STT;

    public PlaceResult() {
        this.namePlace = null;
        this.STT = null;
    }

    public PlaceResult(String STT, String namePlace) {
        this.namePlace = namePlace;
        this.STT = STT;
    }

    public String getNamePlace() {
        return namePlace;
    }

    public void setNamePlace(String namePlace) {
        this.namePlace = namePlace;
    }

    public String getSTT() {
        return STT;
    }

    public void setSTT(String STT) {
        this.STT = STT;
    }
}
