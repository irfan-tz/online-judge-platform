# Generated by Django 5.2 on 2025-06-22 17:50

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Problem',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('description', models.TextField()),
                ('time_limit', models.IntegerField()),
                ('memory_limit', models.IntegerField()),
            ],
        ),
    ]
