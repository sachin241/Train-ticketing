from django.contrib import admin
from .models import Station, Train, TrainStop, Booking


@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ("code", "name")
    search_fields = ("code", "name")


@admin.register(Train)
class TrainAdmin(admin.ModelAdmin):
    list_display = ("train_number", "train_name", "total_seats", "available_seats")
    search_fields = ("train_number", "train_name")


@admin.register(TrainStop)
class TrainStopAdmin(admin.ModelAdmin):
    list_display = ("train", "station", "stop_order", "arrival_time", "departure_time")
    list_filter = ("train",)
    ordering = ("train", "stop_order")


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ("passenger_name", "train", "seat_number", "booking_date")
    list_filter = ("train",)
    search_fields = ("passenger_name",)
