from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("trains/", views.trains_list, name="trains"),
    path("book/", views.book_ticket, name="book"),
    path("bookings/", views.bookings_list, name="bookings"),
]
