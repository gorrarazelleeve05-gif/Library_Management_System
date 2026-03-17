from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import datetime


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Book',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('author', models.CharField(max_length=255)),
                ('isbn', models.CharField(max_length=20, unique=True)),
                ('genre', models.CharField(choices=[('fiction','Fiction'),('non_fiction','Non-Fiction'),('science','Science'),('history','History'),('biography','Biography'),('technology','Technology'),('philosophy','Philosophy'),('other','Other')], default='other', max_length=50)),
                ('total_copies', models.PositiveIntegerField(default=1)),
                ('available_copies', models.PositiveIntegerField(default=1)),
                ('published_year', models.IntegerField(blank=True, null=True)),
                ('description', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={'ordering': ['title']},
        ),
        migrations.CreateModel(
            name='Member',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('phone', models.CharField(blank=True, default='', max_length=20)),
                ('joined_at', models.DateTimeField(auto_now_add=True)),
                ('member_type', models.CharField(blank=True, default='', max_length=50)),
                ('bio', models.TextField(blank=True, default='')),
                ('photo_b64', models.TextField(blank=True, default='')),
                ('profile_updated_at', models.DateTimeField(blank=True, null=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='member_profile', to='auth.user')),
            ],
            options={'ordering': ['user__first_name']},
        ),
        migrations.CreateModel(
            name='BorrowRecord',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('borrow_date', models.DateField(default=datetime.date.today)),
                ('due_date', models.DateField()),
                ('return_date', models.DateField(blank=True, null=True)),
                ('status', models.CharField(choices=[('pending','Pending'),('borrowed','Borrowed'),('returned','Returned'),('overdue','Overdue'),('rejected','Rejected')], default='pending', max_length=20)),
                ('notes', models.TextField(blank=True, default='')),
                ('admin_notes', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('book', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='borrow_records', to='books.book')),
                ('member', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='borrow_records', to='books.member')),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
