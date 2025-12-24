from django.db import models


class Station(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Train(models.Model):
    train_number = models.CharField(max_length=10, unique=True)
    train_name = models.CharField(max_length=100)
    total_seats = models.PositiveIntegerField()
    available_seats = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.train_number} - {self.train_name}"


class TrainStop(models.Model):
    train = models.ForeignKey(Train, on_delete=models.CASCADE, related_name="stops")
    station = models.ForeignKey(Station, on_delete=models.CASCADE)
    stop_order = models.PositiveIntegerField()

    arrival_time = models.TimeField(null=True, blank=True)
    departure_time = models.TimeField(null=True, blank=True)

    class Meta:
        unique_together = ("train", "stop_order")
        ordering = ["stop_order"]

    def __str__(self):
        return f"{self.train} → {self.station} ({self.stop_order})"


class Booking(models.Model):
    passenger_name = models.CharField(max_length=100)
    train = models.ForeignKey(Train, on_delete=models.CASCADE, related_name="bookings")
    seat_number = models.PositiveIntegerField()
    booking_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.passenger_name} | {self.train} | Seat {self.seat_number}"
