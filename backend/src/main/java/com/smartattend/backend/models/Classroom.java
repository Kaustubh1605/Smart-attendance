package com.smartattend.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "classrooms")
public class Classroom {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String building;
    
    @Column(nullable = false)
    private String roomNumber;
    
    private int capacity;
    
    private double lat;
    private double lng;
    private double radiusMeters;
    
    private String geofenceStatus = "active";
    
    @Column(unique = true)
    private String bleBeaconId;
    
    private String bleStatus = "active";
    private String localNetworkSsid;
    private String localNetworkStatus;
    private boolean offlineEnabled = false;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }

    public double getRadiusMeters() { return radiusMeters; }
    public void setRadiusMeters(double radiusMeters) { this.radiusMeters = radiusMeters; }

    public String getGeofenceStatus() { return geofenceStatus; }
    public void setGeofenceStatus(String geofenceStatus) { this.geofenceStatus = geofenceStatus; }

    public String getBleBeaconId() { return bleBeaconId; }
    public void setBleBeaconId(String bleBeaconId) { this.bleBeaconId = bleBeaconId; }

    public String getBleStatus() { return bleStatus; }
    public void setBleStatus(String bleStatus) { this.bleStatus = bleStatus; }

    public String getLocalNetworkSsid() { return localNetworkSsid; }
    public void setLocalNetworkSsid(String localNetworkSsid) { this.localNetworkSsid = localNetworkSsid; }

    public String getLocalNetworkStatus() { return localNetworkStatus; }
    public void setLocalNetworkStatus(String localNetworkStatus) { this.localNetworkStatus = localNetworkStatus; }

    public boolean isOfflineEnabled() { return offlineEnabled; }
    public void setOfflineEnabled(boolean offlineEnabled) { this.offlineEnabled = offlineEnabled; }
}
