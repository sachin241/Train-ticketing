import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import transaction

from .models import Train, TrainStop, Booking


@require_http_methods(["GET"])
def trains_list(request):
    source_code = request.GET.get("source")
    dest_code = request.GET.get("destination")

    trains = Train.objects.all()
    result = []

    for train in trains:
        stops = TrainStop.objects.filter(train=train).order_by("stop_order")
        if not stops.exists():
            continue

        first = stops.first()
        last = stops.last()

        # default source/destination (full route)
        source_name = first.station.name
        dest_name = last.station.name

        # if search params provided
        if source_code and dest_code:
            try:
                source_stop = stops.get(station__code=source_code)
                dest_stop = stops.get(station__code=dest_code)
            except TrainStop.DoesNotExist:
                continue

            if source_stop.stop_order >= dest_stop.stop_order:
                continue

            source_name = source_stop.station.name
            dest_name = dest_stop.station.name

        result.append({
            "id": train.id,
            "train_number": train.train_number,
            "train_name": train.train_name,
            "source": source_name,
            "destination": dest_name,
            "available_seats": train.available_seats,
        })

    return JsonResponse(result, safe=False)


@csrf_exempt
@require_http_methods(["POST"])
def book_ticket(request):
    try:
        body = json.loads(request.body)
        passenger_name = body.get("passenger_name")
        train_id = body.get("train_id")

        if not passenger_name or not train_id:
            return JsonResponse(
                {"error": "passenger_name and train_id required"},
                status=400
            )

        with transaction.atomic():
            train = Train.objects.select_for_update().get(id=train_id)

            if train.available_seats <= 0:
                return JsonResponse(
                    {"error": "No seats available"},
                    status=400
                )

            seat_number = train.total_seats - train.available_seats + 1

            booking = Booking.objects.create(
                passenger_name=passenger_name,
                train=train,
                seat_number=seat_number,
            )

            train.available_seats -= 1
            train.save()

        return JsonResponse({
            "success": True,
            "train": train.train_name,
            "seat_number": seat_number
        }, status=201)

    except Train.DoesNotExist:
        return JsonResponse({"error": "Train not found"}, status=404)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)


@require_http_methods(["GET"])
def bookings_list(request):
    bookings = Booking.objects.select_related("train").order_by("-booking_date")

    data = []
    for b in bookings:
        data.append({
            "passenger_name": b.passenger_name,
            "train_name": b.train.train_name,
            "seat_number": b.seat_number,
            "booking_date": b.booking_date.strftime("%Y-%m-%d %H:%M"),
        })

    return JsonResponse(data, safe=False)
