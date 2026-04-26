//
// This library persists simple (JSON-stringifiable) data through save-loads.
// For example, it can persist the entries in a plain object:
//
//     const building = {
//        target: 0,
//        queue: [{a: 1}, {b: 2}]
//     };
//
//     SaveLoad.persist(template);
//
// It can also perist the static fields in a class:
//
//     class Foo {
//       static count = 0;
//     }
//     SaveLoad.persist(Foo);
//
// Make sure SaveLoad.persist() is called AFTER the class is declared.
// Alternatively, you can do this:
//
//     class Bar {
//       static {
//         SaveLoad.persist(this);
//       }
//       static count = 0;
//     }
//

class SaveLoad {
	static objects = [];
	static persist(obj)
	{
		SaveLoad.objects.push(obj);
	}
};

namespace("SaveLoad_");

function SaveLoad_eventGameSaving()
{
	globalThis.SaveLoad_objects = SaveLoad.objects.map(obj => Object.fromEntries(Object.entries(obj)));
}
function SaveLoad_eventGameLoaded()
{
	for (let i = 0; i < SaveLoad.objects.length; i++)
	{
		Object.assign(SaveLoad.objects[i], globalThis.SaveLoad_objects[i]);
	}
}
